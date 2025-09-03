interface Feature {
  text: string;
}

interface FeaturesProps {
  title: string;
  features: Feature[];
}

export default function Features({ title, features }: FeaturesProps) {
  return (
    <section className="relative py-[120px] pb-[90px]">
      <div className="text-left mb-3 -mt-24">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
      </div>

      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature: Feature, index: number) => (
            <div
              key={index}
              className="wow fadeInUp transition-transform duration-500 hover:-translate-y-2"
            >
              <div className="text-center p-10 bg-white shadow-lg rounded-xl">
                <div className="flex justify-center mx-auto items-center w-14 h-14 text-2xl text-white bg-[var(--fixnix-lightpuple)] rounded-full transition-all duration-500 hover:bg-[var(--fixnix-darkpurple)]">
                  ✓
                </div>
                <h3 className="mt-4 text-[17px] font-semibold leading-[30px] text-[var(--fixnix-darkpurple)] transition-all duration-500 hover:text-[var(--fixnix-lightpuple)]">
                  {feature.text}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
