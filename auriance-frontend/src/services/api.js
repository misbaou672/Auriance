// src/services/api.js
export const API_BASE_URL = 'http://127.0.0.1:8090';

export const loginUser = async (username, password) => {
    console.log(`Tentative de connexion vers ${API_BASE_URL}/auth/login avec ${username}`);
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Erreur Login:', error);
            throw new Error(error.detail || 'Erreur de connexion');
        }

        const data = await response.json();
        console.log('Login succès:', data);
        return data;
    } catch (error) {
        console.error('Exception Login:', error);
        throw error;
    }
};

export const registerUser = async (userData) => {
    const formData = new FormData();
    // Le backend attend 'username', 'email', 'password', 'full_name'
    formData.append('username', userData.username);
    formData.append('email', userData.email);
    formData.append('password', userData.password);

    const fullName = `${userData.prenom || ''} ${userData.nom || ''}`.trim();
    if (fullName) {
        formData.append('full_name', fullName);
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erreur d\'inscription');
    }

    return response.json();
};

export const getCurrentUser = async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user');
    }

    return response.json();
};

export const generateFormJson = async (transcription) => {
    const formData = new FormData();
    formData.append('transcription', transcription);
    formData.append('form_type', 'medical');

    const response = await fetch(`${API_BASE_URL}/api/auriance/form-json`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to generate form JSON');
    }
    return response.json();
};

export const saveConsultation = async (data, token) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    });

    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/auriance/save-consultation`, {
        method: 'POST',
        headers: headers,
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to save consultation');
    }
    return response.json();
};

export const savePdf = async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/auriance/save-pdf`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to generate PDF');
    }
    return response.blob();
};

// Transcription History Functions
// Transcription History Functions
export const saveTranscription = async (data, token) => {
    // Correction : language doit être 'fr', pas 'fr-FR', et duration_seconds attendu
    const lang = (data.language || 'fr').split('-')[0];
    const response = await fetch(`${API_BASE_URL}/data/transcriptions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: data.text,
            language: lang,
            duration_seconds: data.duration_seconds || data.duration || 0,
            audio_file_path: data.audio_file_path || null,
            confidence_score: data.confidence_score || null,
            type: data.type
        }),
    });

    if (!response.ok) {
        let error = {};
        try { error = await response.json(); } catch (e) { }
        throw new Error(error.detail || 'Failed to save transcription');
    }
    return response.json();
};

export const getTranscriptions = async (limit = 100) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/data/transcriptions?limit=${limit}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch transcriptions');
    }
    return response.json();
};

export const deleteTranscription = async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/data/transcriptions/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to delete transcription');
    }
};

export const exportTranscriptionPdf = async (data, token) => {
    const response = await fetch(`${API_BASE_URL}/api/auriance/export-transcription-pdf`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: data.text,
            title: data.title || 'Transcription Vocale',
            language: data.language || 'fr-FR',
            duration: data.duration || 0,
            type: data.type
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to generate PDF');
    }
    return await response.blob();
};

export const updateUserProfile = async (data, token) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update profile');
    }
    return response.json();
};

export const deleteUser = async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete account');
    }
    return true; // Succès
};

export const saveExtraction = async (data, token) => {
    const response = await fetch(`${API_BASE_URL}/data/extractions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to save extraction');
    }
    return response.json();
};

export const saveGeneratedQuery = async (data, token) => {
    const response = await fetch(`${API_BASE_URL}/data/generated-queries`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to save generated query');
    }
    return response.json();
};

export const deleteExtraction = async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/data/extractions/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to delete extraction');
    }
};


// ===== ASSISTANT MEDICAL API =====

export const assistantQuery = async (question, language = 'fr') => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, language }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "L'assistant IA est temporairement indisponible.");
    }
    return response.json();
};

export const getAssistantSchema = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/assistant/schema`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch schema');
    return response.json();
};

export const analyzeTranscription = async (transcriptionId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(
        `${API_BASE_URL}/api/assistant/transcriptions/${transcriptionId}/analyze`,
        {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        }
    );
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Analysis failed');
    }
    return response.json();
};

export const getFilteredTranscriptions = async (filters = {}) => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            params.append(key, value);
        }
    });
    const response = await fetch(
        `${API_BASE_URL}/api/assistant/transcriptions?${params.toString()}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
    if (!response.ok) throw new Error('Failed to fetch transcriptions');
    return response.json();
};

export const generatePatientReport = async (data) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/assistant/reports/generate`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Report generation failed');
    }
    return response.json();
};

export const linkTranscriptionToPatient = async (transcriptionId, patientId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(
        `${API_BASE_URL}/api/assistant/transcriptions/${transcriptionId}/link-patient/${patientId}`,
        {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
        }
    );
    if (!response.ok) throw new Error('Failed to link transcription');
    return response.json();
};
