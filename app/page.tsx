import Image from 'next/image';

const CLUSTER_IDENTIFIER = process.env.NEXT_PUBLIC_CLUSTER_IDENTIFIER!;

export default function Home() {
  return (
    <div className="flex flex-col items-center pt-20">
      <Image
        src="/aurora-logo.jpeg"
        alt="Aurora Logo"
        width={200}
        height={200}
        className="rounded-full shadow-md"
      />
      <h1 className="text-4xl font-bold mt-4 text-[#4B6AED]">Aurora DSQL</h1>
      <p className="text-xl mt-4 font-semibold text-gray-600">
        Fully-Managed Serverless SQL on AWS
      </p>
      <div className="mt-8 flex items-center justify-center">
        <a
          href={`https://us-east-1.console.aws.amazon.com/dsql/clusters/${CLUSTER_IDENTIFIER}/home?region=us-east-1`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#4B6AED] text-white px-4 py-2 rounded-md shadow-md flex items-center"
        >
          <Image
            src="/bookmark.svg"
            alt="Bookmark"
            width={20}
            height={20}
            className="mr-2"
          />
          Open Aurora Console
        </a>
      </div>
    </div>
  );
}
