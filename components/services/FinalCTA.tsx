import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { whatsappLink } from './data';

export const FinalCTA = () => {
    return (
        <motion.section 
            className="relative overflow-hidden rounded-3xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
        >
            <div className="absolute inset-0 gradient-primary" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

            <div className="relative p-6 text-center">
                <h3 className="text-2xl font-bold text-white mb-3">
                    جاهز تبدأ رحلتك الصحية الحقيقية؟
                </h3>
                <p className="text-white/80 mb-6">
                    لا تنتظر - كل يوم تأخر هو يوم صحتك تتعب أكثر. احجز الآن وخلنا نبدأ سوياً.
                </p>

                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-white text-primary hover:bg-white/90 rounded-xl px-8 h-14 text-lg font-bold shadow-lg group">
                        <MessageCircle className="w-5 h-5 ml-2" />
                        📱 احجز على WhatsApp الآن
                    </Button>
                </a>

                <p className="text-white/70 text-sm mt-6">
                    💚 "معي، أنت مش مجرد رقم - كل مريض قصة أهتم فيها شخصياً"
                </p>
            </div>
        </motion.section>
    );
};
