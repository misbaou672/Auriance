import React, { useState } from 'react';

const ApiDocsPage = () => {
    const [activeTab, setActiveTab] = useState('python');

    const codeSnippets = {
        python: `from auriance import AurianceClient

client = AurianceClient(api_key="sk_live_...")

# 1. Transcription Audio
audio_file = open("consultation.mp3", "rb")
transcript = client.transcribe(audio_file)

# 2. Extraction Intelligent (Form Filling)
data = client.extract(
    text=transcript,
    schema__id="medical_report_v2"
)

print(data.json())
# {
#   "patient": "M. Dupont",
#   "symptoms": ["fièvre", "toux"],
#   "diagnosis": "Grippe A"
# }`,
        js: `import { AurianceClient } from '@auriance/node-sdk';

const client = new AurianceClient('sk_live_...');

// 1. Transcription Audio
const transcript = await client.transcribe('./consultation.mp3');

// 2. Extraction Intelligent
const data = await client.extract({
  text: transcript,
  schemaId: 'medical_report_v2'
});

console.log(data);`,
        curl: `curl -X POST https://api.auriance.com/v1/extract \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Patient de 45 ans présentant une toux...",
    "schema_id": "medical_report_v2"
  }'`
    };

    return (
        <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        Une API conçue pour les développeurs
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Intégrez la puissance de nos modèles vocaux et NLP en quelques lignes de code.
                        Documentation complète, SDKs typés et support réactif.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">

                    {/* Left Column: Endpoints list */}
                    <div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700">
                                Core Endpoints
                            </div>
                            <div className="divide-y divide-slate-100">
                                <div className="p-4 flex items-center group cursor-pointer hover:bg-blue-50 transition-colors">
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-mono font-bold mr-3">POST</span>
                                    <span className="font-mono text-slate-700 text-sm">/v1/audio/transcribe</span>
                                    <span className="ml-auto text-slate-400 text-sm group-hover:text-blue-500">Docs →</span>
                                </div>
                                <div className="p-4 flex items-center group cursor-pointer hover:bg-blue-50 transition-colors">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-mono font-bold mr-3">POST</span>
                                    <span className="font-mono text-slate-700 text-sm">/v1/extract/form</span>
                                    <span className="ml-auto text-slate-400 text-sm group-hover:text-blue-500">Docs →</span>
                                </div>
                                <div className="p-4 flex items-center group cursor-pointer hover:bg-blue-50 transition-colors">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-mono font-bold mr-3">POST</span>
                                    <span className="font-mono text-slate-700 text-sm">/v1/query/generate</span>
                                    <span className="ml-auto text-slate-400 text-sm group-hover:text-blue-500">Docs →</span>
                                </div>
                                <div className="p-4 flex items-center group cursor-pointer hover:bg-blue-50 transition-colors">
                                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-mono font-bold mr-3">GET</span>
                                    <span className="font-mono text-slate-700 text-sm">/v1/databases/schemas</span>
                                    <span className="ml-auto text-slate-400 text-sm group-hover:text-blue-500">Docs →</span>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-4">SDKs Disponibles</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-lg border border-slate-200 flex items-center">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3 text-2xl">🐍</div>
                                <div>
                                    <div className="font-semibold text-slate-900">Python</div>
                                    <div className="text-xs text-slate-500">v2.1.0</div>
                                </div>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-slate-200 flex items-center">
                                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center mr-3 text-2xl">📜</div>
                                <div>
                                    <div className="font-semibold text-slate-900">Node.js</div>
                                    <div className="text-xs text-slate-500">v1.4.2</div>
                                </div>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-slate-200 flex items-center">
                                <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center mr-3 text-2xl">📱</div>
                                <div>
                                    <div className="font-semibold text-slate-900">Flutter</div>
                                    <div className="text-xs text-slate-500">v0.9.5</div>
                                </div>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-slate-200 flex items-center">
                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mr-3 text-2xl">⚛️</div>
                                <div>
                                    <div className="font-semibold text-slate-900">React</div>
                                    <div className="text-xs text-slate-500">v1.0.0</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Code Example */}
                    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl">
                        <div className="flex bg-slate-800 p-2">
                            {['python', 'js', 'curl'].map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setActiveTab(lang)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === lang
                                            ? 'bg-slate-700 text-white'
                                            : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {lang.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <div className="p-6 overflow-x-auto">
                            <pre className="font-mono text-sm leading-relaxed text-blue-300">
                                <code>{codeSnippets[activeTab]}</code>
                            </pre>
                        </div>
                        <div className="bg-slate-800 p-4 text-xs text-slate-400 border-t border-slate-700 flex justify-between">
                            <span>View full reference on GitHub</span>
                            <span className="flex items-center text-green-400">
                                <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                                Systems Operational
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ApiDocsPage;
