#!/usr/bin/env python3
"""Additive Directus catalog import. Existing editorial values are preserved."""
import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request
import uuid


def run():
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--credentials-file', type=Path)
    parser.add_argument('--environment', default='production')
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    catalogs = {name: json.loads((root / 'cms' / f'{name}.json').read_text()) for name in ('ui-texts', 'feature-flags')}
    if not args.apply:
        print({key: len(rows) for key, rows in catalogs.items()})
        return
    credentials = json.loads(args.credentials_file.read_text()) if args.credentials_file else os.environ
    url = credentials.get('DIRECTUS_URL', 'http://127.0.0.1:8055').rstrip('/')
    token = credentials.get('DIRECTUS_ADMIN_TOKEN')

    def request(method, path, data=None):
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = 'Bearer ' + token
        req = urllib.request.Request(url + path, data=json.dumps(data).encode() if data is not None else None, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.load(response).get('data') if response.status != 204 else None

    if not token:
        token = request('POST', '/auth/login', {'email': credentials['DIRECTUS_ADMIN_EMAIL'], 'password': credentials['DIRECTUS_ADMIN_PASSWORD']})['access_token']
    collections = {row['collection'] for row in request('GET', '/collections')}
    if 'ui_texts' not in collections:
        raise SystemExit('Execute a migração 20261031B-interface-controls do fin-cms antes da importação.')
    now = datetime.now(timezone.utc).isoformat()
    for name, rows in catalogs.items():
        collection, key = ('ui_texts', 'text_key') if name == 'ui-texts' else ('feature_flags', 'flag_key')
        query = f'/items/{collection}?limit=-1&fields={key}'
        if name == 'feature-flags':
            query += '&filter[environment][_eq]=' + urllib.parse.quote(args.environment)
        found = {row[key] for row in request('GET', query)}
        pending = []
        for row in rows:
            if row[key] in found:
                continue
            item = {'id': str(uuid.uuid4()), key: row[key], 'slug': row[key] + ('.' + args.environment if name == 'feature-flags' else ''), 'locale': 'pt-BR', 'status': 'published', 'published_at': now}
            if name == 'ui-texts':
                item.update(value=row['value'], source=row['source'])
            else:
                item.update(enabled=True, environment=args.environment)
            pending.append(item)
        for offset in range(0, len(pending), 100):
            request('POST', f'/items/{collection}', pending[offset:offset + 100])
        print(f'{collection}: {len(pending)} adicionados; {len(found)} existentes preservados')


if __name__ == '__main__':
    try:
        run()
    except urllib.error.HTTPError as error:
        # Upstream errors can contain credentials; report status only.
        raise SystemExit(f'Directus respondeu HTTP {error.code}; importação interrompida, pode ser retomada.') from None
