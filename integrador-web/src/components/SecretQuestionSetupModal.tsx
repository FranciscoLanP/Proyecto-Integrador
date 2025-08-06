'use client';

import React, { useState, useEffect } from 'react';

interface SecretQuestionSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const SECRET_QUESTIONS = [
    '¿Cuál es el nombre de tu primera mascota?',
    '¿En qué ciudad naciste?',
    '¿Cuál es el nombre de tu escuela primaria?',
    '¿Cuál es tu comida favorita?',
    '¿Cuál es el nombre de tu mejor amigo de la infancia?'
];

export default function SecretQuestionSetupModal({
    isOpen,
    onClose,
    onSuccess
}: SecretQuestionSetupModalProps) {
    const [selectedQuestion, setSelectedQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedQuestion || !answer.trim()) {
            setError('Todos los campos son obligatorios');
            return;
        }

        if (answer.trim().length < 2) {
            setError('La respuesta debe tener al menos 2 caracteres');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/setup-secret-question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    secretQuestion: selectedQuestion,
                    secretAnswer: answer.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al configurar pregunta secreta');
            }

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                handleClose();
            }, 1500);

        } catch (error: any) {
            console.error('Error:', error);
            setError(error.message || 'Error al configurar pregunta secreta');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setSelectedQuestion('');
            setAnswer('');
            setError('');
            setSuccess(false);
            onClose();
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 animate-scaleIn">
                {success ? (
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="rounded-full bg-green-100 p-3">
                                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">
                            ¡Configuración Completa!
                        </h3>
                        <p className="text-sm text-gray-600">
                            Tu pregunta secreta ha sido configurada correctamente.
                            Ahora podrás recuperar tu contraseña si la olvidas.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center mb-4">
                            <div className="rounded-full bg-amber-100 p-2 mr-3">
                                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                                Configurar Pregunta de Seguridad
                            </h3>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-4">
                                <strong>🔒 Configuración de Seguridad Requerida</strong>
                                <br />
                                Para completar tu acceso al sistema y habilitar la recuperación de contraseña,
                                necesitas configurar una pregunta secreta. Esta información se usa exclusivamente
                                para la recuperación de tu cuenta.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                                    Pregunta Secreta
                                </label>
                                <select
                                    id="question"
                                    value={selectedQuestion}
                                    onChange={(e) => setSelectedQuestion(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                    required
                                >
                                    <option value="">Selecciona una pregunta...</option>
                                    {SECRET_QUESTIONS.map((question, index) => (
                                        <option key={index} value={question}>
                                            {question}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                                    Respuesta
                                </label>
                                <input
                                    type="text"
                                    id="answer"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Escribe tu respuesta aquí..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                    required
                                    minLength={2}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Recuerda tu respuesta exactamente como la escribes
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={loading}
                                    className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Salir
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !selectedQuestion || !answer.trim()}
                                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Configurando...</span>
                                        </>
                                    ) : (
                                        <span>Completar Configuración</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
