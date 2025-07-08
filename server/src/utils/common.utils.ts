export interface MailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export const cosineSimilarity= (a:any, b:any)=> {
  const dot = a.reduce((sum:number, val:number, i:number) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum:number, val:number) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum:number, val:number) => sum + val * val, 0));
  return dot / (magA * magB);
}
