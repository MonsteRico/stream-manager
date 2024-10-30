import { Card, CardContent } from "@/components/ui/card";
import { Twitter, Youtube, Instagram, MessageCircle, Twitch } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
const CasterInfoCard = ({
    id,
    name,
    pronouns,
    instagram,
    twitter,
    youtube,
    twitch,
    showSocials = true,
}: {
    id?: number;
    name: string;
    pronouns?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    twitch?: string;
    showSocials?: boolean;
}) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
        <Card className="w-64">
            <CardContent className="p-4">
                <div className="flex items-center space-x-4 mb-2">
                    <div>
                        <h3 className="font-semibold">{name}</h3>
                        <p className="text-sm text-muted-foreground">{pronouns}</p>
                    </div>
                </div>
                {showSocials && (
                    <div className="flex flex-col justify-center w-full">
                        <div className={cn("flex flex-row items-center w-full gap-4 opacity-0", instagram && "opacity-100")}>
                            <Instagram className="h-6 w-6" />
                            <p className="text-sm">{instagram}</p>
                        </div>
                        <div className={cn("flex flex-row items-center w-full gap-4 opacity-0", twitter && "opacity-100")}>
                            <Twitter className="h-6 w-6" />
                            <p className="text-sm">{twitter}</p>
                        </div>
                        <div className={cn("flex flex-row items-center w-full gap-4 opacity-0", youtube && "opacity-100")}>
                            <Youtube className="h-6 w-6" />
                            <p className="text-sm">{youtube}</p>
                        </div>
                        <div className={cn("flex flex-row items-center w-full gap-4 opacity-0", twitch && "opacity-100")}>
                            <Twitch className="h-6 w-6" />
                            <p className="text-sm">{twitch}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    </motion.div>
);

export default CasterInfoCard;
