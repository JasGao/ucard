"use client";

import { useState } from "react";
import Image from "next/image";
import VerificationModal from "./component/verification-modal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVerificationSuccess = (phoneNumber: string) => {
    console.log("Phone verified:", phoneNumber);
    // You can add additional logic here, like showing a success message
    // or redirecting to another page
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded"></div>
            <span className="text-white">UCard with FUN</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
          >
            JOIN NOW
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-blue-900/30 to-transparent rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            UCard With FUN
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed">
            Welcome to Ucard: Where Fun Pays Off! Dive into a world where every tap, every game, and every adventure with Ucard unlocks exciting rewards and experiences. It's not just a card; it's your key to a universe of play!
          </p>
        </div>
      </section>

      {/* Section 1: The Welcome Quest */}
      <section id="welcome" className="relative -mt-32 z-20 container mx-auto px-6 pb-20">
        <div className="max-w-6xl mx-auto bg-zinc-900/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Your Passport to the Play-Economy
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                Why settle for a card that just sits in your wallet? Ucard turns your everyday moves into an epic adventure. Start your journey today and transform the way you interact with the world. It's time to stop just "using" and start playing.
              </p>
            </div>
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src="/Gemini_Generated_Image_tfuemvtfuemvtfue.png"
                alt="Welcome Quest"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Play to Earn */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto bg-zinc-900/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src="/Gemini_Generated_Image_tfuemvtfuemvtfue (1).png"
                alt="Play to Earn"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Gamify Every Transaction
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                Every time you use Ucard, you're playing for keeps. Earn Ucredits through in-app mini-games, daily login streaks, and hidden "Easter Egg" challenges. It's the only card where "High Scores" translate to real-world power.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: The Skill Tree */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto bg-zinc-900/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Level Up Your Experience
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                Your Ucard evolves with you. As you gain XP, you'll unlock a branching skill tree that gives you real advantages. Choose your path: will you be a Loot Master for better credit multipliers, or a Social Scout to unlock group rewards with friends?
              </p>
            </div>
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src="/Gemini_Generated_Image_2jpu8i2jpu8i2jpu.png"
                alt="Skill Tree"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Epic Customization */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto bg-zinc-900/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Stand Out From the Deck
            </h2>
            <p className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto">
              Don't be a generic player. Use your Ucredits to unlock rare digital "Skins" for your app interface and limited-edition physical card designs. From neon-glow finishes to 8-bit retro vibes, make your Ucard as unique as your playstyle.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: The Final Boss (Call to Action) */}
      <section id="cta" className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center bg-zinc-900/95 backdrop-blur-sm rounded-3xl p-12 md:p-16 shadow-2xl border border-blue-500/20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Join the Game?
          </h2>
          <p className="text-xl text-white/80 mb-8 leading-relaxed">
            The world is your map, and Ucard is your controller. Sign up now to receive a Starter Loot Box featuring bonus Ucredits and a "Rookie" badge to kick off your adventure. Your first quest begins the moment you tap below.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-5 bg-blue-600 text-white rounded-lg text-xl font-bold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-xl"
          >
            Start Your Quest! 🎯
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/60 mb-4 md:mb-0 font-medium flex items-center gap-2">
              <span>© 2024</span>
              <span className="text-white font-bold">UCard with FUN</span>
              <span>. Made with</span>
              <span className="animate-pulse">💜</span>
              <span>and fun!</span>
            </div>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-white/60 hover:text-white transition-colors font-medium"
              >
                Privacy 🔒
              </a>
              <a
                href="#"
                className="text-white/60 hover:text-white transition-colors font-medium"
              >
                Terms 📝
              </a>
              <a
                href="#"
                className="text-white/60 hover:text-white transition-colors font-medium"
              >
                Contact 💌
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </div>
  );
}
