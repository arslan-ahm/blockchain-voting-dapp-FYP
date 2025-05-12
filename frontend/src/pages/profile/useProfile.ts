import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchUserDetails, updateUserDetails } from "../../store/thunks/userThunks";
import { usePinata } from "../../hooks/usePinata";
import { Role } from "../../types";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    dateOfBirth: z.number().min(0, "Invalid date"),
    identityNumber: z.string().min(1, "Identity number is required"),
    contactNumber: z.string().min(1, "Contact number is required"),
    bio: z.string().optional(),
    profileImage: z.instanceof(File).optional(),
    supportiveLinks: z.array(z.string()).optional(),
});

export const useProfile = () => {
    const dispatch = useAppDispatch();
    const { uploadFile } = usePinata();
    const user = useAppSelector((state) => state.user);
    const isEditable = user.role === Role.Unverified || user.role === Role.PendingVerification;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user.details?.name || "",
            email: user.details?.email || "",
            dateOfBirth: user.details?.dateOfBirth || 0,
            identityNumber: user.details?.identityNumber || "",
            contactNumber: user.details?.contactNumber || "",
            bio: user.details?.bio || "",
            profileImage: undefined,
            supportiveLinks: user.details?.supportiveLinks || [],
        },
    });

    useEffect(() => {
        if (user.account) {
            dispatch(fetchUserDetails(user.account));
        }
    }, [user.account, dispatch]);

    useEffect(() => {
        if (user.details) {
            form.reset({
                name: user.details.name,
                email: user.details.email,
                dateOfBirth: user.details.dateOfBirth,
                identityNumber: user.details.identityNumber,
                contactNumber: user.details.contactNumber,
                bio: user.details.bio,
                supportiveLinks: user.details.supportiveLinks,
            });
        }
    }, [user.details, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            let profileImageIpfsHash = user.details?.profileImageIpfsHash || "";
            if (values.profileImage) {
                profileImageIpfsHash = await uploadFile(values.profileImage);
            }
            dispatch(updateUserDetails({
                ...values,
                bio: values.bio || "",
                profileImageIpfsHash,
                supportiveLinks: values.supportiveLinks || [],
            }));
        } catch (error) {
            console.error("Failed to update user details:", error);
            form.setError("profileImage", { message: "Failed to upload image" });
        }
    };

    return { user, form, onSubmit, isLoading: user.loading, isEditable };
};