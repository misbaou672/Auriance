import requests
import json

# Test 1: French text, translate to French (should now work)
response = requests.post('http://127.0.0.1:8001/api/auriance/translate-text', 
                         data={'text': 'alors are you my name is violette', 'target_lang': 'fr'})
print('Test 1: FR text → FR translation')
print(f'Status: {response.status_code}')
result = response.json()
print(f'Original: {result["original_text"]}')
print(f'Translated: {result["translated_text"]}')
print(f'Same? {result["original_text"] == result["translated_text"]}')
print()

# Test 2: English text, translate to French (should work)
response = requests.post('http://127.0.0.1:8001/api/auriance/translate-text', 
                         data={'text': 'hello how are you', 'target_lang': 'fr'})
print('Test 2: EN text → FR translation')
print(f'Status: {response.status_code}')
result = response.json()
print(f'Original: {result["original_text"]}')
print(f'Translated: {result["translated_text"]}')
