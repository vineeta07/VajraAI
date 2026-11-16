import { useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Check, Download, FileSpreadsheet, Play, UploadCloud, X } from 'lucide-react';
import { Button, Card, CardHeader, PageHeader, td, th } from '@/ui';
import { analysisFailure, useRunAnalysis } from '@/components/PipelineStatus';
import { describeError, uploadTransactions } from '@/lib/api';
import { COLUMNS, parseUpload, SAMPLE_CSV } from '@/lib/parseUpload';
import { cx, formatINR, formatInt, lowerFirst, plural, timeAgo } from '@/lib/format';

function downloadSample() {
  const url = URL.createObjectURL(new Blob([SAMPLE_CSV], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vajraai-sample.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function Alert({ tone = 'high', title, children }) {
  const cls = tone === 'high' ? 'border-high/30 bg-high-soft text-high' : 'border-medium/30 bg-medium-soft text-medium';
  return (
    <div className={cx('rounded-md border px-4 py-3 text-sm', cls)} role="alert">
      <strong className="font-semibold">{title}</strong>
      {children && <div className="mt-1 opacity-90">{children}</div>}
    </div>
  );
}

export default function Upload() {
  const { pipeline } = useOutletContext();
  const qc = useQueryClient();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [saved, setSaved] = useState(null);

  const upload = useMutation({
    mutationFn: uploadTransactions,
    onSuccess: (_, rows) => {
      setSaved(rows.length);
      toast.success(`${plural(rows.length, 'transaction')} saved`);
      setFile(null);
      setParsed(null);
      qc.invalidateQueries();
    },
  });
  const analyse = useRunAnalysis();

  const take = async (f) => {
    if (!f) return;
    setFile(f);
    setParsed(null);
    setParseError(null);
    setSaved(null);
    upload.reset();
    try {
      setParsed(await parseUpload(f));
    } catch (e) {
      setParseError(e.message);
    }
  };
  const clear = () => {
    setFile(null);
    setParsed(null);
    setParseError(null);
    upload.reset();
    if (inputRef.current) inputRef.current.value = '';
  };

  const serverDown = pipeline.stage === 'api' || pipeline.stage === 'database';
  const uploadErr = upload.error ? describeError(upload.error) : null;
  const analyseErr = analyse.error ? analysisFailure(analyse.error, pipeline) : null;
  const stored = pipeline.data?.transactions ?? 0;
  const pending = pipeline.pendingAnalysis;
  const canUpload = parsed && parsed.missing.length === 0 && parsed.rows.length > 0;

  return (
    <>
      <title>Upload & analyse · VajraAI</title>
      <PageHeader
        title="Upload & analyse"
        description="Add payment records, then score them. Uploading adds to what is already stored; analysis re-scores everything."
        actions={<Button variant="secondary" icon={Download} onClick={downloadSample}>Sample CSV</Button>}
      />

      {serverDown && (
        <div className="mb-5">
          <Alert title={pipeline.stage === 'api' ? 'Uploads are unavailable: the API server can’t be reached.' : 'Uploads are unavailable: the server can’t reach its database.'}>
            You can still choose a file and check it. Saving will work once the server is back — see Overview for how to fix it.
          </Alert>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader title="1 · Choose a file" hint="CSV or JSON. The file is checked in your browser before anything is sent." />
            <div className="px-5 pb-5">
              {!file ? (
                <label
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); take(e.dataTransfer.files?.[0]); }}
                  className={cx(
                    'flex cursor-pointer flex-col items-center rounded-lg border border-dashed px-6 py-11 text-center transition-colors',
                    dragging ? 'border-accent bg-accent-soft' : 'border-line-strong hover:border-ink-3 hover:bg-sunken/50'
                  )}
                >
                  <UploadCloud className="mb-3 size-7 text-ink-3" strokeWidth={1.6} />
                  <span className="text-[15px] font-medium text-ink">Drop a file here, or <span className="text-accent underline underline-offset-2">browse</span></span>
                  <span className="mt-1 text-[13px] text-ink-3">.csv or .json</span>
                  <input ref={inputRef} type="file" accept=".csv,.json" className="sr-only" onChange={(e) => take(e.target.files?.[0])} />
                </label>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-line bg-sunken/50 px-4 py-3">
                  <FileSpreadsheet className="size-5 shrink-0 text-ink-2" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ink">{file.name}</div>
                    <div className="num text-[13px] text-ink-3">
                      {(file.size / 1024).toFixed(1)} KB{parsed && ` · ${plural(parsed.total, 'row')} read`}
                    </div>
                  </div>
                  <button onClick={clear} aria-label="Remove file" className="inline-flex size-8 items-center justify-center rounded-md text-ink-3 hover:bg-surface hover:text-ink">
                    <X className="size-4" />
                  </button>
                </div>
              )}

              {parseError && <div className="mt-4"><Alert title="This file can’t be used.">{parseError}</Alert></div>}

              {parsed?.missing.length > 0 && (
                <div className="mt-4">
                  <Alert title={`Required ${parsed.missing.length === 1 ? 'column is' : 'columns are'} missing: ${parsed.missing.join(', ')}`}>
                    The file’s columns are: {parsed.headers.join(', ') || '(none)'}. Rename the matching columns or add the missing ones, then choose the file again.
                  </Alert>
                </div>
              )}

              {parsed && parsed.missing.length === 0 && (
                <div className="mt-4 space-y-4">
                  {parsed.skipped.length > 0 && (
                    <Alert tone="medium" title={`${plural(parsed.skipped.length, 'row')} will be skipped`}>
                      <ul className="num space-y-0.5">
                        {parsed.skipped.slice(0, 5).map((s) => <li key={s.line}>Line {s.line}: {s.reason}</li>)}
                        {parsed.skipped.length > 5 && <li>…and {formatInt(parsed.skipped.length - 5)} more</li>}
                      </ul>
                    </Alert>
                  )}
                  {parsed.rows.length === 0 ? (
                    <Alert title="No usable rows.">Every row has a problem, so there is nothing to upload.</Alert>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-line">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px] border-collapse">
                          <thead className="border-b border-line bg-sunken/50">
                            <tr>
                              <th className={th}>Vendor</th>
                              <th className={th}>Department</th>
                              <th className={th}>Location</th>
                              <th className={th}>Date</th>
                              <th className={`${th} text-right`}>Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-line">
                            {parsed.rows.slice(0, 5).map((r, i) => (
                              <tr key={i}>
                                <td className={`${td} py-2.5`}>{r.vendor_name} <span className="font-mono text-[12.5px] text-ink-3">{r.vendor_id}</span></td>
                                <td className={`${td} py-2.5 text-ink-2`}>{r.department}</td>
                                <td className={`${td} py-2.5 text-ink-2`}>{r.location || '—'}</td>
                                <td className={`${td} num py-2.5 text-ink-2`}>{r.transaction_date}</td>
                                <td className={`${td} num py-2.5 text-right`}>{formatINR(r.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {parsed.rows.length > 5 && <div className="num border-t border-line px-5 py-2 text-[13px] text-ink-3">First 5 of {formatInt(parsed.rows.length)} rows</div>}
                    </div>
                  )}
                  {COLUMNS.filter((c) => !c.required && !parsed.mapping[c.key]).length > 0 && parsed.rows.length > 0 && (
                    <p className="text-[13px] text-ink-3">
                      Optional columns not found: {COLUMNS.filter((c) => !c.required && !parsed.mapping[c.key]).map((c) => c.key).join(', ')}. The upload will work; the checks that depend on them are skipped.
                    </p>
                  )}
                </div>
              )}

              {uploadErr && <div className="mt-4"><Alert title={`Upload failed: ${lowerFirst(uploadErr.title)}.`}>{uploadErr.detail}{uploadErr.tech && <code className="mt-1 block text-xs">{uploadErr.tech}</code>}</Alert></div>}

              {saved != null && !file && (
                <div className="mt-4 flex items-center gap-2.5 rounded-md border border-low/30 bg-low-soft px-4 py-3 text-sm text-low">
                  <Check className="size-4 shrink-0" strokeWidth={2.5} />
                  <span><strong className="font-semibold">{plural(saved, 'transaction')} saved.</strong> Run the analysis to score them.</span>
                </div>
              )}

              {file && (
                <div className="mt-5 flex items-center gap-3">
                  <Button icon={UploadCloud} disabled={!canUpload || serverDown} loading={upload.isPending} onClick={() => upload.mutate(parsed.rows)}>
                    {upload.isPending ? 'Saving…' : canUpload ? `Upload ${plural(parsed.rows.length, 'transaction')}` : 'Upload'}
                  </Button>
                  <Button variant="ghost" onClick={clear}>Cancel</Button>
                </div>
              )}
            </div>
          </Card>

          <Card data-tour="analyse">
            <CardHeader title="2 · Run the analysis" hint="Scores every stored transaction with the anomaly model and the rule engine. Previous scores are replaced." />
            <div className="px-5 pb-5">
              <dl className="mb-4 grid grid-cols-3 divide-x divide-line rounded-lg border border-line text-sm">
                <div className="px-4 py-3">
                  <dt className="text-[13px] text-ink-3">Stored</dt>
                  <dd className="num mt-0.5 text-lg font-semibold text-ink">{pipeline.data ? formatInt(stored) : '—'}</dd>
                </div>
                <div className="px-4 py-3">
                  <dt className="text-[13px] text-ink-3">Awaiting a score</dt>
                  <dd className={cx('num mt-0.5 text-lg font-semibold', pending > 0 ? 'text-medium' : 'text-ink')}>{pipeline.data ? formatInt(pending) : '—'}</dd>
                </div>
                <div className="px-4 py-3">
                  <dt className="text-[13px] text-ink-3">Last run</dt>
                  <dd className="mt-0.5 text-[15px] font-medium text-ink">{pipeline.data?.lastAnalysis ? timeAgo(pipeline.data.lastAnalysis) : pipeline.data ? 'Never' : '—'}</dd>
                </div>
              </dl>

              {pipeline.data?.ml === false && (
                <div className="mb-4">
                  <Alert tone="medium" title="The ML service isn’t answering.">
                    The server couldn’t reach the scoring model{pipeline.data.mlUrl ? <> at <code>{pipeline.data.mlUrl}</code></> : ''}. Start it with <code>uvicorn ml_transformer_service:app --port 8000</code> inside <code>ml-service</code>, otherwise the analysis will fail.
                  </Alert>
                </div>
              )}
              {analyseErr && <div className="mb-4"><Alert title={`${analyseErr.title}.`}>{analyseErr.detail}{analyseErr.tech && <code className="mt-1 block text-xs">{analyseErr.tech}</code>}</Alert></div>}

              <div className="flex flex-wrap items-center gap-3">
                <Button icon={Play} loading={analyse.isPending} disabled={serverDown || stored === 0} onClick={() => analyse.mutate()}>
                  {analyse.isPending ? 'Analysing…' : 'Run analysis'}
                </Button>
                {analyse.isSuccess && <Button variant="secondary" to="/dashboard">See the results</Button>}
                <span className="text-[13px] text-ink-3">
                  {serverDown ? 'Unavailable while the server is down.' : stored === 0 && pipeline.data ? 'Upload at least one transaction first.' : analyse.isPending ? 'This can take up to a minute for large files.' : ''}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader title="Expected columns" hint="Header names are matched case-insensitively." />
          <ul className="divide-y divide-line border-t border-line">
            {COLUMNS.map((c) => {
              const found = parsed ? Boolean(parsed.mapping[c.key]) : null;
              return (
                <li key={c.key} className="flex gap-3 px-5 py-2.5">
                  <span className={cx('mt-1 inline-flex size-4 shrink-0 items-center justify-center rounded-full', found === true ? 'bg-low-soft text-low' : found === false && c.required ? 'bg-high-soft text-high' : 'bg-sunken text-ink-3')}>
                    {found === true ? <Check className="size-3" strokeWidth={3} /> : found === false && c.required ? <X className="size-3" strokeWidth={3} /> : null}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-[13px] text-ink">{c.key}</code>
                      {!c.required && <span className="text-xs text-ink-3">optional</span>}
                    </div>
                    <div className="text-[13px] text-ink-3">{c.note}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
