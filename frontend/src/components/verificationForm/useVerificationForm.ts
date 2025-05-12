import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { requestVerification } from "../../store/thunks/verificationThunks";
import { usePinata } from "../../hooks/usePinata";
import { useContract } from "../../hooks/useContract";
import type { Role } from "../../types";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";

const formSchema = z.object({
  role: z.string().min(1, "Please select a role"),
  document: z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB"),
});

export const useVerificationForm = () => {
  const dispatch = useAppDispatch();
  const { uploadFile } = usePinata();
  const user = useAppSelector((state) => state.user);
  const { status } = useAppSelector((state) => state.verification);
  const contract = useContract(user.provider ?? undefined);
  const [hasActiveCampaign, setHasActiveCampaign] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "",
      document: undefined,
    },
  });

  useEffect(() => {
    const checkCampaign = async () => {
      if (contract) {
        const active = await contract.hasActiveCampaign();
        setHasActiveCampaign(active);
      }
    };
    checkCampaign();
  }, [contract]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const ipfsHash = await uploadFile(values.document);
      const role = Number(values.role) as unknown as Role;
      dispatch(requestVerification({ role, docIpfsHash: ipfsHash }));
    } catch (error) {
        console.error("Error uploading file:", error);
      form.setError("document", { message: "Failed to upload document" });
    }
  };

  return { form, onSubmit, isLoading: status === "pending", hasActiveCampaign };
};