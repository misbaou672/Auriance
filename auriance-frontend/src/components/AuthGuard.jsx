import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthGuard = ({ user, children, loading }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-neutral-900 text-white">Chargement...</div>;
    }

    return user ? children : null;
};

export default AuthGuard;
