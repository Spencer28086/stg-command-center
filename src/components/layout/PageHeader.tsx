type PageHeaderProps = {
    eyebrow?: string;
    title: string;
    description: string;
    action?: React.ReactNode;
};

export function PageHeader({
    eyebrow = "STG Command Center",
    title,
    description,
    action,
}: PageHeaderProps) {
    return (
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <p className="text-sm font-medium uppercase tracking-[0.35em] text-[#d4af37]">
                    {eyebrow}
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                    {title}
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-stone-400 md:text-base">
                    {description}
                </p>
            </div>

            {action ? <div>{action}</div> : null}
        </section>
    );
}