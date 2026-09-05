interface AdBannerProps {
  className?: string;
}

export default function AdBanner({ className = '' }: AdBannerProps) {
  return (
    <div className={`py-8 px-4 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Advertisement label */}
        <p className="text-stardust text-xs text-center mb-2 uppercase tracking-wider">
          Advertisement
        </p>

        {/* Ad container */}
        <div className="mx-auto max-w-[728px] h-[90px] md:h-[90px] bg-nebula/50 border border-dashed border-gold/30 rounded-lg flex items-center justify-center">
          {/* 
            Google AdSense script goes here
            Replace this placeholder with:
            <ins className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
              data-ad-slot="YOUR_SLOT_ID"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          */}
          <p className="text-stardust text-sm">
            Ad Space (728×90)
          </p>
        </div>
      </div>
    </div>
  );
}