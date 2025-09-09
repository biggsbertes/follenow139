import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Clock, Bell, Search } from "lucide-react";

const Receber = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Receber Encomendas
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Acompanhe suas entregas e saiba como receber seus objetos
            </p>
          </div>

          {/* Tracking Section */}
          <Card className="max-w-2xl mx-auto mb-12">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-primary">
                Rastrear Objeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  placeholder="Digite o código de rastreamento"
                  className="flex-1 h-12"
                />
                <Button size="lg" className="h-12 px-8">
                  <Search className="w-5 h-5 mr-2" />
                  Rastrear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Services Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-primary">Agências</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Encontre a agência mais próxima para retirar sua encomenda
                </p>
                <Button variant="outline" className="w-full">
                  Localizar Agência
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-primary">Horários</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Consulte os horários de funcionamento das agências
                </p>
                <Button variant="outline" className="w-full">
                  Ver Horários
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bell className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-primary">Notificações</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Receba alertas sobre suas entregas por SMS ou email
                </p>
                <Button variant="outline" className="w-full">
                  Configurar
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-primary">
                Como Receber sua Encomenda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-primary">
                    Entrega Domiciliar
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Aguarde o carteiro em casa no horário de entrega</li>
                    <li>• Tenha um documento de identidade em mãos</li>
                    <li>• Se não estiver, deixe um responsável autorizado</li>
                    <li>• Confira os dados antes de assinar o recebimento</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-primary">
                    Retirada na Agência
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Leve documento de identidade original</li>
                    <li>• Apresente o aviso de chegada</li>
                    <li>• Verifique os dados da encomenda</li>
                    <li>• Objetos ficam 30 dias para retirada</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Receber;