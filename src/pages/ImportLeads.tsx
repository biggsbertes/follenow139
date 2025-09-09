import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileUp, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CSV_HEADERS = [
  "Name","CPF","Email","Telephone","Country","State","City","Address","Zipcode","Merchant","Product","Product Value","Provider","Service","Tracking","Provider Info 1","Provider Info 2","Provider Info 3"
];

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:3001";

function splitCsvLine(line: string): string[] {
  // Método mais robusto para dividir CSV
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Aspas duplas escapadas
        current += '"';
        i++; // Pular próxima aspas
      } else {
        // Toggle aspas
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Separador encontrado fora de aspas
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Adicionar último campo
  result.push(current.trim());
  
  return result;
}

function parseCsv(text: string): { ok: true; rows: Record<string, string>[] } | { ok: false; error: string } {
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return { ok: false, error: "Arquivo CSV vazio." };
  
  const headerLine = lines[0];
  const headers = splitCsvLine(headerLine).map(h => h.replace(/^\ufeff/, "").trim());
  
  console.log(`[CSV DEBUG] Headers encontrados (${headers.length}):`, headers);
  
  // Verificar se tem pelo menos as colunas obrigatórias
  const requiredHeaders = ["Name", "CPF", "Email", "Tracking"];
  const missingHeaders = requiredHeaders.filter(req => !headers.includes(req));
  
  if (missingHeaders.length > 0) {
    return { ok: false, error: `Colunas obrigatórias ausentes: ${missingHeaders.join(", ")}` };
  }
  
  // Mapear headers para o formato padrão (ignorar duplicatas)
  const headerMap: Record<string, string> = {};
  const usedHeaders = new Set<string>();
  
  headers.forEach(header => {
    if (CSV_HEADERS.includes(header) && !usedHeaders.has(header)) {
      headerMap[header] = header;
      usedHeaders.add(header);
    }
  });
  
  // Se não encontrou todas as colunas obrigatórias no mapeamento, usar as originais
  if (Object.keys(headerMap).length < requiredHeaders.length) {
    headers.forEach(header => {
      if (!headerMap[header]) {
        headerMap[header] = header;
      }
    });
  }
  
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length === 1 && cols[0] === "") continue;
    
    console.log(`[CSV DEBUG] Linha ${i + 1}: ${cols.length} colunas (headers: ${headers.length})`);
    
    // Ser mais tolerante com número de colunas
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { 
      obj[h] = cols[idx] ?? ""; 
    });
    
    // Se tem menos colunas que headers, preencher com vazio
    if (cols.length < headers.length) {
      console.log(`[CSV DEBUG] Preenchendo ${headers.length - cols.length} colunas vazias na linha ${i + 1}`);
      for (let j = cols.length; j < headers.length; j++) {
        obj[headers[j]] = "";
      }
    }
    
    rows.push(obj);
  }
  
  return { ok: true, rows };
}

const ImportLeads = () => {
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importToken, setImportToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  const handleImportCsv = async () => {
    if (!csvFile) {
      toast({ title: "Selecione um arquivo CSV.", variant: "destructive" });
      return;
    }

    if (!importToken.trim()) {
      toast({ title: "Token de importação é obrigatório.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = String(reader.result || "");
        const parsed = parseCsv(text);
        
        if (!parsed.ok) {
          setImportResult({ success: false, message: parsed.error });
          toast({ title: "Erro ao importar CSV", description: parsed.error, variant: "destructive" });
          return;
        }

        const now = Date.now();
        const imported = parsed.rows.map((r) => ({ 
          id: crypto.randomUUID(), 
          fields: r, 
          status: "pending", 
          createdAt: now 
        }));

        const response = await fetch(`${API_BASE}/api/secure/import-leads`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${importToken.trim()}`
          },
          body: JSON.stringify({ rows: imported }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Falha na importação");
        }

        setImportResult({ 
          success: true, 
          message: data.message, 
          count: data.imported 
        });
        
        toast({ 
          title: "Importação realizada com sucesso!", 
          description: `${data.imported} leads importados.`,
          variant: "default"
        });

        // Limpar arquivo após sucesso
        setCsvFile(null);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        setImportResult({ success: false, message: errorMessage });
        toast({ 
          title: "Erro na importação", 
          description: errorMessage, 
          variant: "destructive" 
        });
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsText(csvFile, "utf-8");
  };

  const downloadTemplate = () => {
    const header = CSV_HEADERS.join(",");
    const blob = new Blob([header + "\n"], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; 
    a.download = "leads-template.csv"; 
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl bg-card border-border shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar Leads - CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Token de Importação */}
          <div className="space-y-2">
            <Label htmlFor="token" className="text-sm font-medium">
              Token de Importação
            </Label>
            <Input
              id="token"
              type="password"
              value={importToken}
              onChange={(e) => setImportToken(e.target.value)}
              placeholder="Digite o token de importação"
              className="bg-background border-border"
            />
            <p className="text-xs text-muted-foreground">
              Token necessário para autenticar a importação
            </p>
          </div>

          {/* Upload de Arquivo */}
          <div className="space-y-2">
            <Label htmlFor="csv-file" className="text-sm font-medium">
              Arquivo CSV
            </Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
              className="bg-background border-border"
            />
            <p className="text-xs text-muted-foreground">
              Formato: Deve conter pelo menos Name, CPF, Email, Tracking. Outras colunas são opcionais.
            </p>
          </div>

          {/* Resultado da Importação */}
          {importResult && (
            <Alert className={importResult.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
              {importResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={importResult.success ? "text-green-800" : "text-red-800"}>
                {importResult.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleImportCsv}
              disabled={!csvFile || !importToken.trim() || isLoading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <FileUp className="w-4 h-4 mr-2" />
                  Importar Leads
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="border-border text-foreground hover:bg-muted"
            >
              Baixar Modelo
            </Button>
          </div>

          {/* Informações Adicionais */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Formato do CSV:</strong> Flexível - aceita colunas extras e duplicatas</p>
            <p><strong>Colunas obrigatórias:</strong> Name, CPF, Email, Tracking</p>
            <p><strong>Segurança:</strong> Apenas com token válido</p>
            <p><strong>Status:</strong> Todos os leads importados começam como "pending"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportLeads;
