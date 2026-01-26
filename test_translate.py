import requests
import json

url = 'http://127.0.0.1:8000/api/auriance/translate-text'
data = {'text': 'hello world how are you', 'target_lang': 'fr', 'source_lang': 'en'}

try:
    response = requests.post(url, data=data)
    print(f'Status: {response.status_code}')
    print(f'Response Headers: {dict(response.headers)}')
    print(f'Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}')
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
