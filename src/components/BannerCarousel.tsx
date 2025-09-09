import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import bannerEducacao from "@/assets/banner-educacao.jpg";
import bannerLogistica from "@/assets/banner-logistica.jpg";

const BannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      id: 1,
      title: "Transforme sua carreira com a Faculdade Correios",
      subtitle: "Cursos de qualidade para profissionais da logística",
      image: bannerEducacao,
      cta: "Conheça nossos cursos",
      link: "/comprar"
    },
    {
      id: 2,
      title: "Novo SAC da Faculdade Correios",
      subtitle: "Atendimento especializado para estudantes",
      image: bannerLogistica,
      cta: "Fale conosco",
      link: "/atendimento"
    },
    {
      id: 3,
      title: "Logística Sustentável",
      subtitle: "Formação em práticas sustentáveis para o futuro",
      image: bannerLogistica,
      cta: "Saiba mais",
      link: "/logistica"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full h-80 md:h-96 bg-gradient-to-r from-primary to-primary-hover overflow-hidden">
      {/* Banner slides */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="min-w-full h-full relative"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 102, 204, 0.8), rgba(0, 102, 204, 0.8)), url(${banner.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="container mx-auto px-4 h-full flex items-center">
              <div className="text-white max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                  {banner.title}
                </h2>
                <p className="text-lg md:text-xl mb-6 drop-shadow">
                  {banner.subtitle}
                </p>
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary-hover font-semibold px-8 py-3"
                  asChild
                >
                  <a href={banner.link}>{banner.cta}</a>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
        onClick={goToPrevious}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
        onClick={goToNext}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;