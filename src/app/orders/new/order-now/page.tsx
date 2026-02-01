'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OrderNowPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>OS para "Pedido Agora"</CardTitle>
          <CardDescription>
            Este formulário ainda está em construção.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Aqui você poderá criar uma Ordem de Serviço simplificada para pedidos do tipo "Pedido Agora".
          </p>
          <Button asChild>
            <Link href="/orders/new">Voltar</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
