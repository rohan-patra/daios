import Image from "next/image";

type DaoHeaderProps = {
  dao: {
    name: string;
    image: string;
    description: string;
  };
};

export default function DaoHeader({ dao }: DaoHeaderProps) {
  return (
    <div className="mb-8 flex items-center gap-6">
      <div className="relative h-24 w-24 overflow-hidden rounded-full">
        <Image src={dao.image} alt={dao.name} fill className="object-cover" />
      </div>
      <div>
        <h1 className="text-3xl font-bold">{dao.name}</h1>
        <p className="text-[#b3a8e0]">{dao.description}</p>
      </div>
    </div>
  );
}
