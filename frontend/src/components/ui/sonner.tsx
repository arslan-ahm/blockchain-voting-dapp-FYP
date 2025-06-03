import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import type { ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast bg-gray-700 text-gray-200 border-gray-600 rounded-md shadow-lg flex items-center gap-2 p-4",
          success: "bg-green-500 border-green-600 text-white",
          error: "bg-red-500 border-red-600 text-white",
          info: "bg-blue-500 border-blue-600 text-white",
          description: "text-gray-300",
          actionButton: "bg-blue-500 text-white hover:bg-blue-600 rounded-md px-3 py-1",
          cancelButton: "bg-gray-600 text-gray-200 Hover:bg-gray-500 rounded-md px-3 py-1",
          closeButton: "bg-gray-800 text-gray-200 hover:bg-gray-600 rounded-full",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };