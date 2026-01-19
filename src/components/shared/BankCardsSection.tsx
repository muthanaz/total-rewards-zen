import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, Plus, Trash2, Star, Gift, Percent, Shield, 
  Plane, ShoppingBag, Coffee, Car, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export interface BankCard {
  id: string;
  cardName: string;
  bank: string;
  cardType: 'credit' | 'debit';
  lastFourDigits: string;
  isPrimary?: boolean;
}

// Mock bank benefits data
const BANK_CARD_BENEFITS: Record<string, { name: string; benefits: Array<{ title: string; discount: string; category: string; icon: React.ElementType }> }> = {
  'Emirates NBD': {
    name: 'Emirates NBD',
    benefits: [
      { title: 'Airport Lounge Access', discount: 'Free', category: 'Travel', icon: Plane },
      { title: 'Careem Rides', discount: '20% off', category: 'Transport', icon: Car },
      { title: 'Namshi Shopping', discount: '15% off', category: 'Shopping', icon: ShoppingBag },
      { title: 'Costa Coffee', discount: 'Buy 1 Get 1', category: 'Food', icon: Coffee },
    ],
  },
  'ADCB': {
    name: 'ADCB',
    benefits: [
      { title: 'Vox Cinemas', discount: '50% off', category: 'Entertainment', icon: Star },
      { title: 'IKEA', discount: '10% off', category: 'Home', icon: Building2 },
      { title: 'Noon Shopping', discount: '15% off', category: 'Shopping', icon: ShoppingBag },
    ],
  },
  'Mashreq': {
    name: 'Mashreq',
    benefits: [
      { title: 'Talabat Orders', discount: '25% off', category: 'Food', icon: Coffee },
      { title: 'Emirates Flights', discount: '10% off', category: 'Travel', icon: Plane },
      { title: 'Amazon.ae', discount: '5% cashback', category: 'Shopping', icon: ShoppingBag },
    ],
  },
  'FAB': {
    name: 'First Abu Dhabi Bank',
    benefits: [
      { title: 'ENTERTAINER Access', discount: 'Free', category: 'Lifestyle', icon: Gift },
      { title: 'Uber Rides', discount: '15% off', category: 'Transport', icon: Car },
      { title: 'Fitness First', discount: '20% off', category: 'Fitness', icon: Star },
    ],
  },
  'DIB': {
    name: 'Dubai Islamic Bank',
    benefits: [
      { title: 'Sharaf DG', discount: '10% off', category: 'Electronics', icon: ShoppingBag },
      { title: 'Spinneys', discount: '5% cashback', category: 'Groceries', icon: ShoppingBag },
    ],
  },
};

const BANKS = Object.keys(BANK_CARD_BENEFITS);

interface BankCardsSectionProps {
  cards: BankCard[];
  onCardsChange: (cards: BankCard[]) => void;
}

export function BankCardsSection({ cards, onCardsChange }: BankCardsSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCard, setNewCard] = useState<Partial<BankCard>>({ cardType: 'credit' });
  const { toast } = useToast();

  const handleAddCard = () => {
    if (!newCard.cardName || !newCard.bank || !newCard.lastFourDigits) {
      toast({ title: 'Missing Information', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    
    const card: BankCard = {
      id: Date.now().toString(),
      cardName: newCard.cardName,
      bank: newCard.bank,
      cardType: newCard.cardType as 'credit' | 'debit',
      lastFourDigits: newCard.lastFourDigits,
      isPrimary: cards.length === 0,
    };
    
    onCardsChange([...cards, card]);
    setNewCard({ cardType: 'credit' });
    setShowAddDialog(false);
    toast({ title: 'Card Linked', description: `${card.cardName} has been added successfully.` });
  };

  const handleRemoveCard = (id: string) => {
    onCardsChange(cards.filter(c => c.id !== id));
    toast({ title: 'Card Removed', description: 'The card has been unlinked from your profile.' });
  };

  const handleSetPrimary = (id: string) => {
    onCardsChange(cards.map(c => ({ ...c, isPrimary: c.id === id })));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-accent" />
          Linked Bank Cards
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Link Card
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {cards.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <CreditCard className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-2">No cards linked yet</p>
            <p className="text-xs text-muted-foreground">Link your bank cards to see exclusive benefits and cashback offers</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Link Your First Card
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  card.isPrimary ? "border-accent bg-accent/5" : "border-border bg-muted/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      card.isPrimary ? "bg-accent/20" : "bg-muted"
                    )}>
                      <CreditCard className={cn("w-5 h-5", card.isPrimary ? "text-accent" : "text-muted-foreground")} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{card.cardName}</p>
                        {card.isPrimary && (
                          <Badge variant="secondary" className="text-[10px] bg-accent/20 text-accent">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {card.bank} • •••• {card.lastFourDigits} • {card.cardType === 'credit' ? 'Credit' : 'Debit'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!card.isPrimary && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-xs h-7"
                        onClick={() => handleSetPrimary(card.id)}
                      >
                        Set Primary
                      </Button>
                    )}
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveCard(card.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Quick benefits preview */}
                {BANK_CARD_BENEFITS[card.bank] && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                      {BANK_CARD_BENEFITS[card.bank].benefits.length} Benefits Available
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      {BANK_CARD_BENEFITS[card.bank].benefits.slice(0, 3).map((benefit, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] bg-background">
                          {benefit.discount}
                        </Badge>
                      ))}
                      {BANK_CARD_BENEFITS[card.bank].benefits.length > 3 && (
                        <Badge variant="secondary" className="text-[10px]">
                          +{BANK_CARD_BENEFITS[card.bank].benefits.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Your card details are securely encrypted. We only store the last 4 digits for identification.</p>
          </div>
        </div>
      </CardContent>

      {/* Add Card Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link a Bank Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Card Name</Label>
              <Input
                placeholder="e.g., Emirates NBD Visa Signature"
                value={newCard.cardName || ''}
                onChange={(e) => setNewCard({ ...newCard, cardName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Bank</Label>
              <Select value={newCard.bank} onValueChange={(v) => setNewCard({ ...newCard, bank: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {BANKS.map((bank) => (
                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Card Type</Label>
                <Select value={newCard.cardType} onValueChange={(v) => setNewCard({ ...newCard, cardType: v as 'credit' | 'debit' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="debit">Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Last 4 Digits</Label>
                <Input
                  placeholder="1234"
                  maxLength={4}
                  value={newCard.lastFourDigits || ''}
                  onChange={(e) => setNewCard({ ...newCard, lastFourDigits: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                />
              </div>
            </div>
            
            {/* Preview benefits */}
            {newCard.bank && BANK_CARD_BENEFITS[newCard.bank] && (
              <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                <p className="text-xs font-medium text-accent mb-2 flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  Benefits you'll unlock:
                </p>
                <div className="flex flex-wrap gap-1">
                  {BANK_CARD_BENEFITS[newCard.bank].benefits.map((benefit, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[10px]">
                      {benefit.title}: {benefit.discount}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddCard}>
              <CreditCard className="w-4 h-4 mr-2" />
              Link Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Export bank benefits for use in Marketplace
export { BANK_CARD_BENEFITS };
