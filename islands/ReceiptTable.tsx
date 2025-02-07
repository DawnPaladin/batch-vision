interface FileRecord {
  filename: string;
  date: string;
  amount: string;
  status: string;
}

interface ReceiptTableProps {
  files: FileRecord[];
}

export default function ReceiptTable({ files }: ReceiptTableProps) {
  return (
    <div class="mt-6">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {files.map((file) => (
            <tr key={file.filename}>
              <td class="px-6 py-4 whitespace-nowrap">{file.filename}</td>
              <td class="px-6 py-4 whitespace-nowrap">{file.date}</td>
              <td class="px-6 py-4 whitespace-nowrap">{file.amount}</td>
              <td class="px-6 py-4 whitespace-nowrap">{file.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 