'use client';

import Image from 'next/image';
import clsx from 'clsx';

const testimonials = [
  {
    name: 'Mickaël',
    city: 'Lille',
    avatar: '/avatars/mickael.jpg',
  },
  {
    name: 'Alexia',
    city: 'Caen',
    avatar: '/avatars/alexia.jpg',
  },
  {
    name: 'Yuza',
    city: 'Caen',
    avatar: '/avatars/yuza.jpg',
  },
  {
    name: 'Franck',
    city: 'Paris',
    avatar: '/avatars/franck.jpg',
  },
];

export const TestimonialsSection = () => {
  // Séparer en 2 colonnes
  const leftColumn = [testimonials[0], testimonials[2]];
  const rightColumn = [testimonials[1], testimonials[3]];

  return (
    <section className="w-full py-24 bg-black flex flex-col items-center text-white relative overflow-visible">
      <h2 className="text-4xl font-bold text-center mb-2">Ils nous font déjà confiance</h2>
      <p className="text-white/70 mb-12">Pourquoi pas vous ?</p>

      {/* Image container */}
      <div className="relative max-w-5xl w-full mx-auto flex justify-center">
        {/* Image */}
        <Image
          src="/salon-temoignages.jpg"
          alt="Salon"
          width={1000}
          height={600}
          className="w-[40rem] h-[30rem] object-cover object-center self-center rounded-3xl"
        />

        {/* Container des cards superposées */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 z-10 flex gap-12 w-[90%] max-w-4xl justify-center pointer-events-none">
          {/* Colonne gauche */}
          <div className="flex flex-col gap-6">
            {leftColumn.map((person, index) => (
              <div
                key={index}
                className={clsx(
                  'bg-white/10 backdrop-blur-md border border-white/10 text-white p-4 rounded-xl flex items-center gap-4 shadow-xl min-w-sm transition-transform duration-300 pointer-events-auto',
                  // décale chaque carte de gauche différemment
                  index === 0 ? 'translate-x-[-1.125rem] translate-y-[-10.625rem]' : 'translate-x-[-6.125rem] translate-y-[-5.625rem]'
                )}
              >
                <Image
                  src={person.avatar}
                  alt={person.name}
                  width={35}
                  height={35}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold text-lg">
                    {person.name}, <span className="text-lg text-white">Propriétaire à {person.city}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Colonne droite */}
          <div className="flex flex-col gap-6">
            {rightColumn.map((person, index) => (
              <div
                key={index}
                className={clsx(
                  'bg-white/10 backdrop-blur-md border border-white/10 text-white p-4 rounded-xl flex items-center gap-4 shadow-xl min-w-sm transition-transform duration-300 pointer-events-auto',
                  // décale chaque carte de droite différemment
                  index === 0 ? 'translate-x-[3.125rem] translate-y-[-7.625rem]' : 'translate-x-[0.625rem] translate-y-[-2.5rem]'
                )}
              >
                <Image
                  src={person.avatar}
                  alt={person.name}
                  width={35}
                  height={35}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold text-lg">
                    {person.name}, <span className="text-lg text-white">Propriétaire à {person.city}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
