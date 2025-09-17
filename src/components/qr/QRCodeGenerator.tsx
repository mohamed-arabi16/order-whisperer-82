import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, QrCode, Table, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RestaurantTable {
  id: string;
  table_number: string;
  location_area?: string;
}

const QRCodeGenerator: React.FC = () => {
  const { user, profile } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [qrType, setQrType] = useState<'general' | 'table'>('general');
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState<{ id: string; slug: string } | null>(null);

  useEffect(() => {
    if (user && profile) {
      loadTenant();
    }
  }, [user, profile]);

  useEffect(() => {
    if (tenant?.id) {
      loadTables();
    }
  }, [tenant]);

  const loadTenant = async () => {
    if (!user || !profile) return;

    try {
      const { data: userTenant, error } = await supabase
        .from('tenants')
        .select('id, slug')
        .eq('owner_id', profile.id)
        .single();

      if (error) throw error;
      setTenant(userTenant);
    } catch (error) {
      console.error('Error loading tenant:', error);
      toast.error('Failed to load restaurant information');
    }
  };

  const loadTables = async () => {
    if (!tenant?.id) return;

    try {
      const { data } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .order('table_number');

      setTables(data || []);
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const generateQRCode = async () => {
    if (!tenant?.slug) return;

    setLoading(true);
    
    try {
      let menuUrl = `${window.location.origin}/#/menu/${tenant.slug}`;
      
      if (qrType === 'table' && selectedTable) {
        const table = tables.find(t => t.id === selectedTable);
        if (table) {
          menuUrl += `?table=${table.id}&tableNumber=${table.table_number}`;
        }
      }

      const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
        width: 300,
        margin: 2,
      });

      setQrCodeUrl(qrCodeDataUrl);
      toast.success('QR code generated successfully');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    const fileName = qrType === 'table' && selectedTable 
      ? `table-${tables.find(t => t.id === selectedTable)?.table_number}-qr.png`
      : `${tenant?.slug}-menu-qr.png`;
    
    link.download = fileName;
    link.href = qrCodeUrl;
    link.click();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={qrType} onValueChange={(value: 'general' | 'table') => setQrType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                General Menu QR
              </div>
            </SelectItem>
            <SelectItem value="table">
              <div className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                Table-Specific QR
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {qrType === 'table' && (
          <Select value={selectedTable} onValueChange={setSelectedTable}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a table..." />
            </SelectTrigger>
            <SelectContent>
              {tables.map((table) => (
                <SelectItem key={table.id} value={table.id}>
                  Table {table.table_number}
                  {table.location_area && ` - ${table.location_area}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button 
          onClick={generateQRCode} 
          disabled={loading || (qrType === 'table' && !selectedTable)}
          className="w-full"
        >
          {loading ? 'Generating...' : 'Generate QR Code'}
        </Button>

        {qrCodeUrl && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img src={qrCodeUrl} alt="QR Code" className="border rounded-lg shadow-sm" />
            </div>
            <Button onClick={downloadQRCode} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;