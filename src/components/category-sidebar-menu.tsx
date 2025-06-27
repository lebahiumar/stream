'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { getVideos } from '@/app/actions/mux';
import type { Video } from '@/types';

async function getCategoriesFromVideos(): Promise<string[]> {
    try {
        const videos = await getVideos();
        const categorySet = new Set(videos.map(v => v.category));
        return Array.from(categorySet);
    } catch (error) {
        console.error("Failed to fetch categories", error);
        return [];
    }
}

export function CategorySidebarMenu() {
    const [categories, setCategories] = useState<string[]>([]);
    const pathname = usePathname();

    useEffect(() => {
        getCategoriesFromVideos().then(setCategories);
    }, []);

    // Fallback to a static list if dynamic categories aren't loaded yet.
    const staticCategories = [ "Travel", "Tech", "Learning", "Comedy", "Gaming", "Documentary", "Cooking" ];
    const displayCategories = categories.length > 0 ? categories.sort() : staticCategories;

    return (
        <SidebarMenu>
          {displayCategories.map((item) => (
            <SidebarMenuItem key={item}>
              <SidebarMenuButton asChild isActive={pathname.startsWith(`/category/${item.toLowerCase()}`)} tooltip={item}>
                <Link href={`/category/${item.toLowerCase()}`}>
                  <Film />
                  <span>{item}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
    );
}
