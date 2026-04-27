import { apiRequest } from "./client";
import type { Family, FamilyInvite, FamilyMember } from "../types/api";

export async function getMyFamily(): Promise<Family> {
  return apiRequest<Family>("/families/me");
}

export async function createFamily(name: string): Promise<Family> {
  return apiRequest<Family>("/families", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  return apiRequest<FamilyMember[]>("/families/members");
}

export async function getFamilyInvites(): Promise<FamilyInvite[]> {
  return apiRequest<FamilyInvite[]>("/families/invites");
}

export async function getMyFamilyInvites(): Promise<FamilyInvite[]> {
  return apiRequest<FamilyInvite[]>("/families/invites/me");
}

export async function createFamilyInvite(email: string): Promise<FamilyInvite> {
  return apiRequest<FamilyInvite>("/families/invites", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function acceptFamilyInvite(inviteId: number): Promise<Family> {
  return apiRequest<Family>(`/families/invites/${inviteId}/accept`, {
    method: "POST",
  });
}
