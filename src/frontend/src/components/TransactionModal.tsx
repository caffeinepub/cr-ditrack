import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddTransaction } from "../hooks/useQueries";

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  existingClients: string[];
  defaultClient?: string;
}

export default function TransactionModal({
  open,
  onClose,
  existingClients,
  defaultClient = "",
}: TransactionModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [clientName, setClientName] = useState(defaultClient);
  const [amount, setAmount] = useState("");
  const [product, setProduct] = useState("");
  const [transactionDate, setTransactionDate] = useState(today);
  const [reminderDate, setReminderDate] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTransaction = useAddTransaction();

  const filteredClients = existingClients.filter(
    (c) =>
      c.toLowerCase().includes(clientName.toLowerCase()) &&
      clientName.length > 0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !amount || !product.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    try {
      await addTransaction.mutateAsync({
        clientName: clientName.trim(),
        amount: Number.parseFloat(amount),
        product: product.trim(),
        transactionDate,
        reminderDate: reminderDate || transactionDate,
      });
      toast.success("Transaction ajout\u00e9e avec succ\u00e8s !");
      handleClose();
    } catch {
      toast.error("Erreur lors de l'ajout de la transaction.");
    }
  };

  const handleClose = () => {
    setClientName(defaultClient);
    setAmount("");
    setProduct("");
    setTransactionDate(today);
    setReminderDate("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        data-ocid="transaction.modal"
        className="max-w-md w-full p-0 overflow-hidden"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-foreground">
              Ajouter une Transaction
            </DialogTitle>
            <button
              type="button"
              data-ocid="transaction.close_button"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Client Name */}
          <div className="space-y-1.5 relative">
            <Label htmlFor="clientName" className="text-sm font-medium">
              Nom du client <span className="text-destructive">*</span>
            </Label>
            <Input
              id="clientName"
              data-ocid="transaction.input"
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Ex: Mamadou Diallo"
              autoComplete="off"
              className="h-11"
            />
            <AnimatePresence>
              {showSuggestions && filteredClients.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
                >
                  {filteredClients.slice(0, 5).map((c) => (
                    <li
                      key={c}
                      onMouseDown={() => {
                        setClientName(c);
                        setShowSuggestions(false);
                      }}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors"
                    >
                      {c}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-sm font-medium">
              Montant (FCFA) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="amount"
              data-ocid="transaction.input"
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 25000"
              className="h-11"
            />
          </div>

          {/* Product */}
          <div className="space-y-1.5">
            <Label htmlFor="product" className="text-sm font-medium">
              Produit vendu <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product"
              data-ocid="transaction.input"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Ex: Riz import\u00e9 50 kg"
              className="h-11"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="txDate" className="text-sm font-medium">
                Date de transaction
              </Label>
              <Input
                id="txDate"
                data-ocid="transaction.input"
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reminderDate" className="text-sm font-medium">
                Date de rappel
              </Label>
              <Input
                id="reminderDate"
                data-ocid="transaction.input"
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              data-ocid="transaction.cancel_button"
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-11"
            >
              Annuler
            </Button>
            <Button
              data-ocid="transaction.submit_button"
              type="submit"
              disabled={addTransaction.isPending}
              className="flex-1 h-11 bg-accent hover:bg-accent/90 text-white font-semibold"
            >
              {addTransaction.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ajout\u2026
                </>
              ) : (
                "Ajouter"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
