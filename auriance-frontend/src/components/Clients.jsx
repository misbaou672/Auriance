import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Clients() {
    const { currentLanguage } = useLanguage();

    const content = {
        FR: {
            title: "Approuvé par les établissements de santé mondiaux",
            clients: [
                "Barkshire Health Systems",
                "Capital Regional Healthcare",
                "LIPS Healthcare",
                "Riverview Medical Center",
                "NYC HEALTH+HOSPITALS",
                "Hôpital Européen Paris",
                "Clinique Lyon Sud"
            ]
        },
        EN: {
            title: "Trusted by healthcare institutions worldwide",
            clients: [
                "Barkshire Health Systems",
                "Capital Regional Healthcare",
                "LIPS Healthcare",
                "Riverview Medical Center",
                "NYC HEALTH+HOSPITALS",
                "European Hospital Paris",
                "Lyon South Clinic"
            ]
        }
    };

    const langContent = content[currentLanguage] || content.FR;

    return (
        <section className="bg-white py-16 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-12">
                        {langContent.title}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 items-center">
                        {langContent.clients.map((client, index) => (
                            <div key={index} className="text-center p-4">
                                <div className="text-gray-700 font-medium text-sm hover:text-blue-600 transition-colors cursor-pointer">
                                    {client}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}