import { motion } from "framer-motion";
import { Invitation } from "@/types";
import { Heart } from "lucide-react";

const CoupleSection = ({ invitation }: { invitation: Invitation }) => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="py-16 bg-background"
  >
    <div className="container mx-auto px-4 max-w-2xl">
      {/* Decorative divider */}
      <div className="text-center text-accent text-2xl mb-8">❀ ─── ❀</div>

      <div className="flex flex-col sm:flex-row items-center gap-8 justify-center">
        {/* Bride */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center group"
        >
          <div className="w-32 h-32 rounded-full mx-auto mb-3 ring-4 ring-accent/30 group-hover:ring-accent/60 transition-all overflow-hidden">
            {invitation.bridePhotoUrl || invitation.couplePhotoUrl ? (
              <img
                src={invitation.bridePhotoUrl || invitation.couplePhotoUrl}
                alt={invitation.brideName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center" />
            )}
          </div>
          <h3 className="font-heading text-lg font-semibold">
            {invitation.brideName}
          </h3>
          <p className="font-body text-sm text-muted-foreground italic mt-1">
            {invitation.brideBio}
          </p>
        </motion.div>

        {/* Heart */}
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="text-center"
        >
          <Heart className="w-8 h-8 text-primary fill-primary mx-auto" />
          <p className="font-script text-lg text-accent mt-2">
            {invitation.hashtag}
          </p>
        </motion.div>

        {/* Groom */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center group"
        >
          <div className="w-32 h-32 rounded-full mx-auto mb-3 ring-4 ring-accent/30 group-hover:ring-accent/60 transition-all overflow-hidden">
            {invitation.groomPhotoUrl || invitation.couplePhotoUrl ? (
              <img
                src={invitation.groomPhotoUrl || invitation.couplePhotoUrl}
                alt={invitation.groomName}
                className="w-full h-full object-cover"
                style={{ objectPosition: "right center" }}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center" />
            )}
          </div>
          <h3 className="font-heading text-lg font-semibold">
            {invitation.groomName}
          </h3>
          <p className="font-body text-sm text-muted-foreground italic mt-1">
            {invitation.groomBio}
          </p>
        </motion.div>
      </div>
    </div>
  </motion.section>
);

export default CoupleSection;
