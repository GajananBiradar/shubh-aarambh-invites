import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, MapPin, Sparkles } from "lucide-react";

const couplePortrait =
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80";
const detailPortrait =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80";
const galleryOne =
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80";
const galleryTwo =
  "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=900&q=80";
const galleryThree =
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80";

const events = [
  {
    day: "Friday",
    title: "Welcome Dinner",
    time: "7:30 PM",
    place: "Villa Aurelia",
  },
  {
    day: "Saturday",
    title: "Wedding Ceremony",
    time: "4:00 PM",
    place: "San Galgano Abbey",
  },
  {
    day: "Saturday",
    title: "Moonlight Reception",
    time: "8:30 PM",
    place: "Cypress Courtyard",
  },
];

const EuropeanEditorialConceptPage = () => {
  return (
    <div
      className="min-h-screen text-stone-900"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(216,191,158,0.38), transparent 22%), radial-gradient(circle at right 10%, rgba(164,132,107,0.14), transparent 18%), linear-gradient(180deg, #f7f1e8 0%, #f3ece3 38%, #ebe1d2 100%)",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Parisienne&display=swap');`}</style>

      <section className="relative overflow-hidden px-5 pb-16 pt-8 sm:px-8 md:px-10 lg:px-14 lg:pb-24 lg:pt-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-center justify-between">
            <div
              className="text-[11px] uppercase tracking-[0.38em] text-stone-600"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              European Editorial Concept
            </div>
            <div
              className="rounded-full border border-stone-400/40 bg-white/50 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-stone-700 backdrop-blur"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Preview Only
            </div>
          </div>

          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div
                className="mb-5 text-[11px] uppercase tracking-[0.42em] text-stone-500"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Florence, Italy • 14 June 2027
              </div>

              <h1
                className="max-w-2xl text-[4.2rem] leading-[0.9] sm:text-[5.5rem] md:text-[7rem] lg:text-[7.6rem]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Isabella
                <br />
                <span className="ml-10 inline-block">&</span> Aarav
              </h1>

              <div
                className="relative -mt-2 mb-8 ml-1 text-4xl text-[#a06f62] sm:text-5xl"
                style={{ fontFamily: "'Parisienne', cursive" }}
              >
                a weekend written like a love story
              </div>

              <p
                className="max-w-xl text-base leading-8 text-stone-700 sm:text-lg"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                A fashion-led invitation concept with layered photography,
                airy European spacing, luxury typography, and stationery-style
                details that feel intimate and expensive.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <div
                  className="rounded-full bg-stone-900 px-6 py-3 text-xs uppercase tracking-[0.24em] text-[#f6efe7]"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  View Ceremony
                </div>
                <div
                  className="rounded-full border border-stone-400/50 px-6 py-3 text-xs uppercase tracking-[0.24em] text-stone-700"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  RSVP Card Style
                </div>
              </div>

              <div className="mt-10 flex items-center gap-3 text-stone-600">
                <Sparkles size={16} />
                <span
                  className="text-xs uppercase tracking-[0.3em]"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  Overlap photos • editorial serif • warm neutral palette
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.15 }}
              className="relative mx-auto h-[640px] w-full max-w-[560px]"
            >
              <div className="absolute right-10 top-0 h-[250px] w-[190px] rounded-[30px] border border-white/70 bg-white/60 p-3 shadow-[0_24px_60px_rgba(73,50,35,0.15)] backdrop-blur">
                <img
                  src={detailPortrait}
                  alt="Editorial detail"
                  className="h-full w-full rounded-[22px] object-cover"
                />
              </div>

              <div className="absolute left-0 top-16 h-[460px] w-[340px] rounded-[40px] bg-[#efe4d3] p-4 shadow-[0_30px_80px_rgba(76,53,39,0.18)]">
                <img
                  src={couplePortrait}
                  alt="Couple portrait"
                  className="h-full w-full rounded-[30px] object-cover"
                />
              </div>

              <div className="absolute bottom-9 right-0 max-w-[280px] rounded-[28px] border border-stone-300/60 bg-[#fbf7f1]/90 p-6 shadow-[0_20px_60px_rgba(76,53,39,0.14)] backdrop-blur">
                <div
                  className="mb-2 text-[10px] uppercase tracking-[0.35em] text-stone-500"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  Invitation Note
                </div>
                <p
                  className="text-3xl leading-none text-stone-900"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Join us for
                  <br />
                  dinner, vows,
                  <br />
                  and dancing
                </p>
                <div className="mt-4 h-px w-full bg-gradient-to-r from-stone-300 to-transparent" />
                <div
                  className="mt-4 text-xs uppercase tracking-[0.28em] text-stone-600"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  San Galgano Abbey
                </div>
              </div>

              <div className="absolute left-8 top-6 h-24 w-24 rounded-full border border-[#b88577]/50" />
              <div className="absolute bottom-0 left-40 h-28 w-28 rounded-full bg-[#d8b8a3]/20 blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 md:px-10 lg:px-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-[36px] border border-stone-300/60 bg-[rgba(255,250,245,0.6)] p-7 shadow-[0_20px_55px_rgba(56,39,28,0.08)] backdrop-blur"
          >
            <div
              className="mb-4 text-[10px] uppercase tracking-[0.38em] text-stone-500"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Story Section
            </div>
            <h2
              className="max-w-md text-5xl leading-[0.95] text-stone-900"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Not a classic invite. More like a wedding editorial.
            </h2>
            <p
              className="mt-6 max-w-md text-base leading-8 text-stone-700"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              This concept uses off-center composition, refined whitespace,
              overlapping imagery, and a tactile paper-card look. It feels
              premium, romantic, and fresh instead of heavily ornamental.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="relative grid min-h-[360px] gap-5 sm:grid-cols-[1fr_0.8fr]"
          >
            <div className="relative h-[360px] rounded-[34px] bg-[#e9ddcb] p-3 shadow-[0_22px_55px_rgba(56,39,28,0.12)]">
              <img
                src={galleryOne}
                alt="Gallery preview one"
                className="h-full w-full rounded-[26px] object-cover"
              />
            </div>
            <div className="flex flex-col gap-5 pt-10">
              <div className="h-[160px] rounded-[28px] border border-white/70 bg-white/70 p-3 shadow-[0_18px_45px_rgba(56,39,28,0.10)]">
                <img
                  src={galleryTwo}
                  alt="Gallery preview two"
                  className="h-full w-full rounded-[22px] object-cover"
                />
              </div>
              <div className="ml-10 h-[190px] rounded-[28px] bg-[#f6efe6] p-3 shadow-[0_18px_45px_rgba(56,39,28,0.10)]">
                <img
                  src={galleryThree}
                  alt="Gallery preview three"
                  className="h-full w-full rounded-[22px] object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 md:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl rounded-[42px] border border-stone-300/55 bg-[rgba(251,246,239,0.82)] p-8 shadow-[0_22px_65px_rgba(56,39,28,0.09)] backdrop-blur sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="mb-4 text-[10px] uppercase tracking-[0.35em] text-stone-500"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Schedule Design
              </div>
              <h2
                className="text-5xl leading-none"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                A timeline styled like
                <br />
                luxury stationery
              </h2>
              <p
                className="mt-5 max-w-md text-base leading-8 text-stone-700"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Instead of generic event cards, the schedule feels like a printed
                menu or itinerary from a destination wedding weekend.
              </p>

              <div className="mt-8 rounded-[28px] bg-stone-900 px-6 py-5 text-[#f5ecdf]">
                <div
                  className="text-[10px] uppercase tracking-[0.36em] text-[#d8c5ad]"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  RSVP Card Preview
                </div>
                <div
                  className="mt-3 text-3xl"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Reply by 20 May
                </div>
                <div
                  className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.24em]"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  Confirm your seat <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>

            <div className="space-y-4">
              {events.map((event, index) => (
                <motion.div
                  key={event.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  className="grid gap-4 rounded-[26px] border border-stone-300/60 bg-white/70 p-5 shadow-[0_14px_35px_rgba(56,39,28,0.08)] sm:grid-cols-[120px_1fr]"
                >
                  <div
                    className="text-xs uppercase tracking-[0.34em] text-stone-500"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    {event.day}
                  </div>
                  <div>
                    <h3
                      className="text-3xl leading-none text-stone-900"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {event.title}
                    </h3>
                    <div
                      className="mt-3 flex flex-wrap gap-5 text-xs uppercase tracking-[0.24em] text-stone-600"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={14} />
                        {event.time}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <MapPin size={14} />
                        {event.place}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EuropeanEditorialConceptPage;
