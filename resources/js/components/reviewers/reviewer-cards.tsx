import { useEffect, useState } from 'react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';
import type { ReviewerItem } from '@/types';

type ReviewerCardsProps = {
    items: ReviewerItem[];
};

function Flashcard({ item, index }: { item: ReviewerItem; index: number }) {
    const [flipped, setFlipped] = useState(false);

    const toggle = () => setFlipped((value) => !value);

    return (
        <button
            type="button"
            onClick={toggle}
            className="flex min-h-72 w-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-8 text-center transition-colors hover:border-ring"
        >
            <span className="font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {flipped ? 'Definition' : `Term ${index + 1}`}
            </span>
            <span className="text-2xl font-semibold text-balance">
                {flipped ? item.definitions.join(' · ') : item.term}
            </span>
            <span className="mt-2 text-xs text-muted-foreground">
                Click to {flipped ? 'see term' : 'reveal definition'}
            </span>
        </button>
    );
}

export default function ReviewerCards({ items }: ReviewerCardsProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!api) {
            return;
        }

        const onSelect = () => setCurrent(api.selectedScrollSnap());
        api.on('select', onSelect);
        api.on('reInit', onSelect);

        return () => {
            api.off('select', onSelect);
            api.off('reInit', onSelect);
        };
    }, [api]);

    return (
        <div className="mx-auto w-full max-w-2xl px-12">
            <Carousel setApi={setApi} opts={{ loop: false }}>
                <CarouselContent>
                    {items.map((item, index) => (
                        <CarouselItem key={item.id ?? index}>
                            <Flashcard item={item} index={index} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious type="button" />
                <CarouselNext type="button" />
            </Carousel>
            <p className="mt-4 text-center text-sm text-muted-foreground">
                {current + 1} / {items.length}
            </p>
        </div>
    );
}
