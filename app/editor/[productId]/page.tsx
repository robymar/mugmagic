"use client";

import React from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import MugMasterEditor from '@/components/editor/mugmaster/MugMasterEditor';
import { TEMPLATES } from '@/data/templates';

export default function EditorPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const productId = params.productId as string;
    const templateId = searchParams.get('templateId');
    const designId = searchParams.get('designId');

    const template = templateId ? TEMPLATES.find(t => t.id === templateId) : null;

    return <MugMasterEditor productId={productId} initialDesign={template?.designData} designId={designId || undefined} />;
}
