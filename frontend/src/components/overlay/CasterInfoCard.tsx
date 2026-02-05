import { Card, CardContent } from "@/components/ui/card";
import { Twitter, Youtube, Instagram, Twitch } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CasterInfoCardProps {
  id?: number;
  name: string;
  pronouns?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  twitch?: string;
  showSocials?: boolean;
  delay?: number;
}

const CasterInfoCard = ({
  name,
  pronouns,
  instagram,
  twitter,
  youtube,
  twitch,
  showSocials = true,
  delay = 0.5,
}: CasterInfoCardProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay: delay + 0.5 }}
  >
    <Card className="w-64 qhd:w-[340px] 4k:w-[512px]">
      <CardContent className="p-4 qhd:p-5 4k:p-8">
        <div className="flex items-center space-x-4 qhd:space-x-5 4k:space-x-8 mb-2 qhd:mb-3 4k:mb-4">
          <div>
            <h3 className="font-semibold qhd:text-lg 4k:text-xl">{name}</h3>
            <p className="text-sm qhd:text-base 4k:text-lg text-muted-foreground">{pronouns}</p>
          </div>
        </div>
        {showSocials && (
          <div className="flex flex-col justify-center w-full">
            <div
              className={cn(
                "flex flex-row items-center w-full gap-4 qhd:gap-5 4k:gap-8 opacity-0",
                instagram && "opacity-100"
              )}
            >
              <Instagram className="h-6 w-6 qhd:h-8 qhd:w-8 4k:h-12 4k:w-12" />
              <p className="text-sm qhd:text-base 4k:text-lg">{instagram}</p>
            </div>
            <div
              className={cn(
                "flex flex-row items-center w-full gap-4 qhd:gap-5 4k:gap-8 opacity-0",
                twitter && "opacity-100"
              )}
            >
              <Twitter className="h-6 w-6 qhd:h-8 qhd:w-8 4k:h-12 4k:w-12" />
              <p className="text-sm qhd:text-base 4k:text-lg">{twitter}</p>
            </div>
            <div
              className={cn(
                "flex flex-row items-center w-full gap-4 qhd:gap-5 4k:gap-8 opacity-0",
                youtube && "opacity-100"
              )}
            >
              <Youtube className="h-6 w-6 qhd:h-8 qhd:w-8 4k:h-12 4k:w-12" />
              <p className="text-sm qhd:text-base 4k:text-lg">{youtube}</p>
            </div>
            <div
              className={cn(
                "flex flex-row items-center w-full gap-4 qhd:gap-5 4k:gap-8 opacity-0",
                twitch && "opacity-100"
              )}
            >
              <Twitch className="h-6 w-6 qhd:h-8 qhd:w-8 4k:h-12 4k:w-12" />
              <p className="text-sm qhd:text-base 4k:text-lg">{twitch}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default CasterInfoCard;
