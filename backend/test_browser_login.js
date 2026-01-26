const testLogin = async () => {
    console.log("🧪 TEST DE CONNEXION DEPUIS LE NAVIGATEUR");
    console.log("=" + "=".repeat(60));

    try {
        const formData = new FormData();
        formData.append('username', 'test_user_1737300444');
        formData.append('password', 'TestPassword123!');

        const response = await fetch('http://localhost:8000/auth/login', {
            method: 'POST',
            body: formData,
        });

        console.log("📡 Status:", response.status);

        if (response.ok) {
            const data = await response.json();
            console.log("✅ LOGIN RÉUSSI!");
            console.log("Token:", data.access_token.substring(0, 30) + "...");
        } else {
            const error = await response.json();
            console.log("❌ ERREUR:", error);
        }
    } catch (error) {
        console.log("❌ ERREUR FETCH:", error.message);
        console.log("💡 Vérifiez la console Network pour voir les détails CORS");
    }
};

// Exécuter le test
testLogin();
