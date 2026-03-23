import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Status } from "../backend";
import {
  useClientTransactions,
  useDeleteTransaction,
  useMarkAsPaid,
} from "../hooks/useQueries";
import {
  formatDate,
  formatFCFA,
  getStatusClass,
  getStatusLabel,
} from "../utils/format";

interface ClientDetailProps {
  clientName: string | null;
  onClose: () => void;
  onAddTransaction: (client: string) => void;
}

export default function ClientDetail({
  clientName,
  onClose,
  onAddTransaction,
}: ClientDetailProps) {
  const { data: transactions = [], isLoading } = useClientTransactions(
    clientName ?? "",
  );
  const markAsPaid = useMarkAsPaid();
  const deleteTransaction = useDeleteTransaction();

  const totalOwed = transactions
    .filter((t) => t.status !== Status.paid)
    .reduce((sum, t) => sum + t.amount, 0);

  const handleMarkPaid = async (id: string) => {
    try {
      await markAsPaid.mutateAsync(id);
      toast.success("Transaction marqu\u00e9e comme pay\u00e9e.");
    } catch {
      toast.error("Erreur lors de la mise \u00e0 jour.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction.mutateAsync(id);
      toast.success("Transaction supprim\u00e9e.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <Sheet open={!!clientName} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        data-ocid="client.sheet"
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="client.close_button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <SheetTitle className="text-lg font-semibold">
              {clientName}
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* KPI strip */}
        <div
          className="px-6 py-5 text-white"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.06 245) 0%, oklch(0.28 0.09 245) 100%)",
          }}
        >
          <p className="text-white/70 text-sm">Total impay\u00e9</p>
          <p className="text-3xl font-extrabold mt-1">
            {formatFCFA(totalOwed)}
          </p>
          <p className="text-white/60 text-xs mt-1">
            {transactions.filter((t) => t.status !== Status.paid).length}{" "}
            transaction(s) en cours
          </p>
        </div>

        {/* Action bar */}
        <div className="px-6 py-3 border-b border-border">
          <Button
            data-ocid="client.primary_button"
            onClick={() => clientName && onAddTransaction(clientName)}
            className="h-9 text-sm bg-accent hover:bg-accent/90 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nouvelle transaction
          </Button>
        </div>

        {/* Transaction list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {isLoading ? (
            <div data-ocid="client.loading_state" className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div
              data-ocid="client.empty_state"
              className="text-center py-12 text-muted-foreground"
            >
              <p className="font-medium">Aucune transaction</p>
              <p className="text-sm mt-1">
                Ajoutez une transaction pour ce client.
              </p>
            </div>
          ) : (
            transactions.map((tx, idx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                data-ocid={`client.transaction.item.${idx + 1}`}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {tx.product}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(tx.transactionDate)}
                    </p>
                    {tx.reminderDate && (
                      <p className="text-xs text-muted-foreground">
                        Rappel : {formatDate(tx.reminderDate)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="font-bold text-sm">
                      {formatFCFA(tx.amount)}
                    </span>
                    <Badge className={getStatusClass(tx.status)}>
                      {getStatusLabel(tx.status)}
                    </Badge>
                  </div>
                </div>
                {tx.status !== Status.paid && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Button
                      data-ocid={`client.transaction.save_button.${idx + 1}`}
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs border-accent/40 text-accent hover:bg-accent/10"
                      disabled={markAsPaid.isPending}
                      onClick={() => handleMarkPaid(tx.id)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Marquer pay\u00e9
                    </Button>
                    <Button
                      data-ocid={`client.transaction.delete_button.${idx + 1}`}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                      disabled={deleteTransaction.isPending}
                      onClick={() => handleDelete(tx.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
