import { useState } from "react";
import { useTranslation } from "@/i18n";
import { handleForgetMe } from "@/lib/session-logger";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function AppFooter() {
  const { t } = useTranslation();
  const [done, setDone] = useState(false);

  async function onConfirm() {
    await handleForgetMe();
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 px-5 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <p className="text-xs text-muted-foreground">{t("footer.forgetMeDescription")}</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="ml-4 text-xs font-medium text-muted-foreground underline underline-offset-2"
            >
              {done ? t("footer.forgetMeDone") : t("footer.forgetMe")}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("footer.forgetMe")}</AlertDialogTitle>
              <AlertDialogDescription>{t("footer.forgetMeConfirm")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.back")}</AlertDialogCancel>
              <AlertDialogAction onClick={onConfirm}>{t("footer.forgetMe")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </footer>
  );
}
