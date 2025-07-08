"use client";

import "./app.css";
import "@appwrite.io/pink-icons";
import { useState, useEffect, useRef, useCallback } from "react";
import { client } from "../lib/appwrite";
import { AppwriteException } from "appwrite";
import Image from "next/image";
import React from "react";
import { useAuth } from "../lib/AuthProvider";

export default function LandingPage() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6 bg-white shadow">
        <div className="text-2xl font-bold text-orange-700">Spin Living</div>
        <nav className="space-x-6 flex items-center">
          <a href="#how" className="text-gray-700 hover:text-orange-700">Comment ça marche</a>
          <a href="#avantages" className="text-gray-700 hover:text-orange-700">Avantages</a>
          <a href="#temoignages" className="text-gray-700 hover:text-orange-700">Témoignages</a>
          {user ? (
            <>
              <a href="/dashboard" className="text-gray-700 hover:text-orange-700">Dashboard</a>
              <button className="text-gray-700 hover:text-orange-700" onClick={() => logout()}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="text-gray-700 hover:text-orange-700">Connexion</a>
              <a
                href="/signup"
                className="bg-orange-700 text-white px-4 py-2 rounded hover:bg-orange-800"
              >
                Inscription
              </a>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-4 py-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-orange-800 mb-4">
          La colocation rotative, <span className="text-yellow-600">simple & flexible</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-700 mb-8">
          Change de coloc, découvre de nouveaux horizons, sans prise de tête.
        </p>
        <a
          href="#how"
          className="inline-block bg-orange-700 text-white px-8 py-3 rounded-full font-semibold shadow hover:bg-orange-800 transition"
        >
          Découvrir le concept
        </a>
      </section>

      {/* Comment ça marche */}
      <section id="how" className="max-w-4xl mx-auto py-16">
        <h2 className="text-3xl font-bold text-center mb-10 text-orange-800">Comment ça marche ?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-4xl mb-2">1️⃣</span>
            <h3 className="font-bold mb-2">Inscris-toi</h3>
            <p className="text-gray-600">Crée ton profil et précise tes préférences de colocation.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-4xl mb-2">2️⃣</span>
            <h3 className="font-bold mb-2">Trouve une coloc</h3>
            <p className="text-gray-600">Découvre les colocations disponibles et rejoins une équipe.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-4xl mb-2">3️⃣</span>
            <h3 className="font-bold mb-2">Rote & découvre</h3>
            <p className="text-gray-600">Change de coloc à chaque cycle et multiplie les rencontres !</p>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section id="avantages" className="bg-orange-50 py-16">
        <h2 className="text-3xl font-bold text-center mb-10 text-orange-800">Pourquoi choisir la colocation rotative ?</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">🤝</span>
            <h3 className="font-bold mb-2">Rencontres</h3>
            <p className="text-gray-600">Fais connaissance avec de nouveaux colocs à chaque rotation.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">🗓️</span>
            <h3 className="font-bold mb-2">Flexibilité</h3>
            <p className="text-gray-600">Change de logement facilement selon tes envies et besoins.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">🔒</span>
            <h3 className="font-bold mb-2">Sérénité</h3>
            <p className="text-gray-600">Un cadre sécurisé et une équipe à l’écoute pour t’accompagner.</p>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section id="temoignages" className="max-w-4xl mx-auto py-16">
        <h2 className="text-3xl font-bold text-center mb-10 text-orange-800">Ils ont testé Spin Living</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="italic text-gray-700">“J’ai rencontré des gens incroyables et je ne me suis jamais ennuyé !”</p>
            <div className="mt-4 font-bold text-orange-700">— Sarah, 27 ans</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="italic text-gray-700">“Le concept est super flexible, parfait pour les jeunes actifs.”</p>
            <div className="mt-4 font-bold text-orange-700">— Lucas, 24 ans</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-6 text-center text-gray-400 text-sm mt-auto">
        © {new Date().getFullYear()} Spin Living — La colocation nouvelle génération
      </footer>
    </div>
  );
}

