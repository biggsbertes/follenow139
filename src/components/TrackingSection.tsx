import { useState } from "react";
import { Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const TrackingSection = () => {
  const [trackingCode, setTrackingCode] = useState("");

  return (
    <section className="bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">
                Acompanhe seu Objeto
              </h2>
              <p className="text-muted-foreground">
                Digite o código de rastreamento para localizar sua encomenda
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="AA123456789BR ou 000.111.222.33"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="flex-1 h-12 text-center sm:text-left"
              />
              <Button 
                size="lg" 
                className="h-12 px-8 bg-primary hover:bg-primary-hover"
              >
                <Search className="w-5 h-5 mr-2" />
                Buscar
              </Button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Exemplo: AA123456789BR ou utilize o CPF/CNPJ
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default TrackingSection;