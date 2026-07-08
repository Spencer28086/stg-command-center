type PlaceholderPanelProps = {
    title: string;
    description?: string;
};

export function PlaceholderPanel({ title, description }: PlaceholderPanelProps) {
    return (
        <section className="mt-8 rounded-3xl border border-[#d4af37]/15 bg-black/45 p-8 shadow-2xl shadow-black/30">
            <p className="text-sm font-medium text-white">{title}</p>

            {description ? (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-400">
                    {description}
                </p>
            ) : null}
        </section>
    );
}