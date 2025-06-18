import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  CloudUpload,
  FileJson,
  Settings,
  Brain,
  Database,
  Sparkles,
  Code2,
  X,
  FileUp,
  ExternalLink
} from 'lucide-react';
import apiService from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export default function ScenarioExporter() {
  const [exportFormat, setExportFormat] = useState('vertex_sft_basic');
  const [splitRatio, setSplitRatio] = useState({ train: 0.9, val: 0.1 });
  const [autotune, setAutotune] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemma-2b');
  const [constitutionVersion, setConstitutionVersion] = useState('');
  const [gcsPrefix, setGcsPrefix] = useState('gs://aethos-datasets/v1');
  const [region, setRegion] = useState('us-central1');
  
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingColab, setIsExportingColab] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [exportError, setExportError] = useState(null);
  const [exportFormats, setExportFormats] = useState({});
  const [showColabModal, setShowColabModal] = useState(false);
  const [pendingColabData, setPendingColabData] = useState(null);

  useEffect(() => {
    loadExportFormats();
  }, []);

  const loadExportFormats = async () => {
    try {
      const formats = await apiService.getExportFormats();
      setExportFormats(formats);
    } catch (error) {
      console.error('Failed to load export formats:', error);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportResult(null);

    try {
      const exportRequest = {
        format: exportFormat,
        gcs_prefix: gcsPrefix,
        filter: constitutionVersion ? { constitution_version: parseInt(constitutionVersion) } : {},
        split: splitRatio,
        autotune: autotune,
        model: selectedModel,
        region: region
      };

      const result = await apiService.exportScenarios(exportRequest);
      setExportResult(result);
    } catch (error) {
      setExportError(error.message || 'Export failed');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportToColab = async () => {
    setIsExportingColab(true);
    setExportError(null);

    try {
      const exportRequest = {
        format: exportFormat,
        gcs_prefix: gcsPrefix,
        filter: constitutionVersion ? { constitution_version: parseInt(constitutionVersion) } : {},
        split: splitRatio,
        autotune: false, // Colab exports handle training manually
        model: selectedModel,
        region: region
      };

      const result = await apiService.exportToColab(exportRequest);
      console.log('Colab export result:', result);
      
      // Download the notebook file
      if (result.download_url) {
        const downloadUrl = `${API_BASE_URL}${result.download_url}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = result.notebook_filename || 'aethos_training_notebook.ipynb';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Store the result and show modal
        setPendingColabData(result);
        setShowColabModal(true);
      }
    } catch (error) {
      setExportError(error.message || 'Colab export failed');
      console.error('Colab export error:', error);
    } finally {
      setIsExportingColab(false);
    }
  };

  const handleOpenColab = () => {
    const colabUploadUrl = 'https://colab.research.google.com/#create=true';
    window.open(colabUploadUrl, '_blank', 'noopener,noreferrer');
    
    // Show success message
    if (pendingColabData) {
      setExportResult({
        ...pendingColabData,
        message: 'Colab notebook downloaded and Google Colab opened! Follow the instructions to upload your notebook.',
        colab_url: pendingColabData.colab_url
      });
    }
    
    // Close modal
    setShowColabModal(false);
    setPendingColabData(null);
  };

  const handleCloseModal = () => {
    // Show success message without opening Colab
    if (pendingColabData) {
      setExportResult({
        ...pendingColabData,
        message: 'Colab notebook downloaded successfully! Upload it to Google Colab when ready.',
        colab_url: pendingColabData.colab_url
      });
    }
    
    setShowColabModal(false);
    setPendingColabData(null);
  };

  const formatOptions = [
    { value: 'vertex_sft_basic', label: 'Vertex AI SFT Basic', icon: '📊' },
    { value: 'vertex_sft_chat', label: 'Vertex AI SFT Chat', icon: '💬' },
    { value: 'vertex_prefs', label: 'Vertex AI Preferences (DPO)', icon: '⚖️' },
    { value: 'vertex_rlhf', label: 'Vertex AI RLHF', icon: '🎯' }
  ];

  const modelOptions = [
    { value: 'gemma-2b', label: 'Gemma 2B' },
    { value: 'gemma-7b', label: 'Gemma 7B' },
    { value: 'gemma-2-2b', label: 'Gemma 2 2B' },
    { value: 'gemma-2-9b', label: 'Gemma 2 9B' },
    { value: 'gemma-2-27b', label: 'Gemma 2 27B' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        {/* Export Configuration Card */}
        <Card style={styles.configCard}>
          <CardHeader style={styles.cardHeader}>
            <CardTitle style={styles.cardTitle}>
              <Database style={styles.titleIcon} />
              Export Configuration
            </CardTitle>
          </CardHeader>
          <CardContent style={styles.cardContent}>
            <div style={styles.formGrid}>
              {/* Format Selection */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>
                  <FileJson style={styles.sectionIcon} />
                  Export Format
                </h3>
                <div style={styles.formatGrid}>
                  {formatOptions.map(format => (
                    <div
                      key={format.value}
                      style={{
                        ...styles.formatOption,
                        ...(exportFormat === format.value ? styles.formatOptionSelected : {})
                      }}
                      onClick={() => setExportFormat(format.value)}
                    >
                      <span style={styles.formatIcon}>{format.icon}</span>
                      <span style={styles.formatLabel}>{format.label}</span>
                      {exportFormat === format.value && (
                        <CheckCircle2 style={styles.checkIcon} />
                      )}
                    </div>
                  ))}
                </div>
                {exportFormats[exportFormat] && (
                  <div style={styles.formatDescription}>
                    <p style={styles.descText}>{exportFormats[exportFormat].description}</p>
                    <code style={styles.schemaCode}>
                      {JSON.stringify(exportFormats[exportFormat].schema, null, 2)}
                    </code>
                  </div>
                )}
              </div>

              {/* Training Configuration */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>
                  <Settings style={styles.sectionIcon} />
                  Training Configuration
                </h3>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Train/Validation Split</label>
                  <div style={styles.splitControls}>
                    <div style={styles.splitInput}>
                      <span style={styles.splitLabel}>Train</span>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={splitRatio.train}
                        onChange={(e) => {
                          const train = parseFloat(e.target.value);
                          setSplitRatio({ train, val: 1 - train });
                        }}
                        style={styles.numberInput}
                      />
                    </div>
                    <div style={styles.splitInput}>
                      <span style={styles.splitLabel}>Val</span>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={splitRatio.val}
                        readOnly
                        style={styles.numberInput}
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Constitution Version Filter</label>
                  <input
                    type="number"
                    placeholder="Leave empty for all versions"
                    value={constitutionVersion}
                    onChange={(e) => setConstitutionVersion(e.target.value)}
                    style={styles.textInput}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>GCS Prefix</label>
                  <input
                    type="text"
                    value={gcsPrefix}
                    onChange={(e) => setGcsPrefix(e.target.value)}
                    style={styles.textInput}
                  />
                </div>
              </div>

              {/* Auto-Tuning Options */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>
                  <Brain style={styles.sectionIcon} />
                  Auto-Tuning Options
                </h3>
                
                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="autotune"
                    checked={autotune}
                    onChange={(e) => setAutotune(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <label htmlFor="autotune" style={styles.checkboxLabel}>
                    Automatically start Vertex AI tuning job after export
                  </label>
                </div>

                {autotune && (
                  <>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Model</label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        style={styles.select}
                      >
                        {modelOptions.map(model => (
                          <option key={model.value} value={model.value}>
                            {model.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Region</label>
                      <input
                        type="text"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        style={styles.textInput}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Export Buttons */}
            <div style={styles.exportButtonContainer}>
              <Button
                onClick={handleExport}
                disabled={isExporting || isExportingColab}
                style={styles.exportButton}
              >
                {isExporting ? (
                  <>
                    <Loader2 style={styles.spinningIcon} />
                    Exporting...
                  </>
                ) : (
                  <>
                    <CloudUpload style={styles.buttonIcon} />
                    Export to Vertex AI
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleExportToColab}
                disabled={isExporting || isExportingColab}
                style={styles.colabButton}
              >
                {isExportingColab ? (
                  <>
                    <Loader2 style={styles.spinningIcon} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Code2 style={styles.buttonIcon} />
                    Export and Train with Colab
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Result Card */}
        {exportResult && (
          <Card style={styles.resultCard}>
            <CardHeader style={styles.cardHeader}>
              <CardTitle style={styles.cardTitle}>
                <CheckCircle2 style={styles.successIcon} />
                Export Completed
              </CardTitle>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              {exportResult.message && (
                <div style={styles.successMessage}>
                  <CheckCircle2 style={styles.messageIcon} />
                  <div>
                    <p style={styles.messageText}>{exportResult.message}</p>
                    {exportResult.colab_url && (
                      <a 
                        href={exportResult.colab_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={styles.colabLink}
                      >
                        <Code2 style={styles.colabLinkIcon} />
                        Open Google Colab
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              <div style={styles.resultGrid}>
                {exportResult.task_id && (
                  <div style={styles.resultItem}>
                    <span style={styles.resultLabel}>Task ID:</span>
                    <code style={styles.resultValue}>{exportResult.task_id}</code>
                  </div>
                )}
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Total Records:</span>
                  <span style={styles.resultValue}>{exportResult.total_records}</span>
                </div>
                {exportResult.splits ? (
                  <>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Train Records:</span>
                      <span style={styles.resultValue}>{exportResult.splits.train || 0}</span>
                    </div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Validation Records:</span>
                      <span style={styles.resultValue}>{exportResult.splits.val || 0}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Train Records:</span>
                      <span style={styles.resultValue}>{exportResult.train_records || 0}</span>
                    </div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Validation Records:</span>
                      <span style={styles.resultValue}>{exportResult.val_records || 0}</span>
                    </div>
                  </>
                )}
                {exportResult.format && (
                  <div style={styles.resultItem}>
                    <span style={styles.resultLabel}>Format:</span>
                    <span style={styles.resultValue}>{exportResult.format}</span>
                  </div>
                )}
              </div>

              {exportResult.vertex_job && (
                <div style={styles.vertexJobInfo}>
                  <Badge variant="success" style={styles.vertexBadge}>
                    <Sparkles style={styles.badgeIcon} />
                    Vertex AI Job Started
                  </Badge>
                  <code style={styles.jobId}>{exportResult.vertex_job}</code>
                </div>
              )}

              {(exportResult.signed_urls || exportResult.download_urls) && (
                <div style={styles.downloadSection}>
                  <h4 style={styles.downloadTitle}>Download Exported Files</h4>
                  {exportResult.note && (
                    <p style={styles.noteText}>{exportResult.note}</p>
                  )}
                  <div style={styles.downloadGrid}>
                    {/* Use download_urls if available (local), otherwise signed_urls (GCS) */}
                    {Object.entries(exportResult.download_urls || exportResult.signed_urls).map(([name, url]) => (
                      <a
                        key={name}
                        href={url.startsWith('/api/') ? `${API_BASE_URL}${url}` : url}
                        download={url.startsWith('/api/')}
                        target={url.startsWith('/api/') ? '_self' : '_blank'}
                        rel="noopener noreferrer"
                        style={styles.downloadLink}
                      >
                        <Download style={styles.downloadIcon} />
                        {name}.jsonl
                      </a>
                    ))}
                    {/* Handle manifest download */}
                    {(exportResult.manifest_download_url || exportResult.manifest_url) && (
                      <a
                        href={
                          exportResult.manifest_download_url 
                            ? `${API_BASE_URL}${exportResult.manifest_download_url}`
                            : exportResult.manifest_url
                        }
                        download={!!exportResult.manifest_download_url}
                        target={exportResult.manifest_download_url ? '_self' : '_blank'}
                        rel="noopener noreferrer"
                        style={styles.downloadLink}
                      >
                        <FileJson style={styles.downloadIcon} />
                        manifest.json
                      </a>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {exportError && (
          <Alert variant="destructive" style={styles.errorAlert}>
            <AlertCircle style={styles.alertIcon} />
            <AlertDescription>{exportError}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <Card style={styles.infoCard}>
          <CardHeader style={styles.cardHeader}>
            <CardTitle style={styles.cardTitle}>
              <Upload style={styles.titleIcon} />
              About Scenario Export
            </CardTitle>
          </CardHeader>
          <CardContent style={styles.cardContent}>
            <div style={styles.infoSection}>
              <h4 style={styles.infoTitle}>What is this?</h4>
              <p style={styles.infoText}>
                Export your AI agent training data directly to Google Cloud Storage 
                and optionally start Vertex AI fine-tuning jobs with a single click.
              </p>
            </div>

            <div style={styles.infoSection}>
              <h4 style={styles.infoTitle}>Data Sources</h4>
              <ul style={styles.dataSourceList}>
                <li>✅ Reasoning traces from wisdom queries</li>
                <li>✅ Agent learning history & reflections</li>
                <li>✅ Approved wisdom cache entries</li>
                <li>✅ Constitutional updates & critiques</li>
              </ul>
            </div>

            <div style={styles.infoSection}>
              <h4 style={styles.infoTitle}>Export Formats</h4>
              <div style={styles.formatInfo}>
                <div style={styles.formatItem}>
                  <strong>SFT Basic:</strong> Simple input/output pairs for supervised fine-tuning
                </div>
                <div style={styles.formatItem}>
                  <strong>SFT Chat:</strong> Conversational format with message history
                </div>
                <div style={styles.formatItem}>
                  <strong>Preferences:</strong> Chosen/rejected pairs for DPO training
                </div>
                <div style={styles.formatItem}>
                  <strong>RLHF:</strong> Actions with reward signals for reinforcement learning
                </div>
              </div>
            </div>

            <div style={styles.infoSection}>
              <h4 style={styles.infoTitle}>Workflow</h4>
              <ol style={styles.workflowList}>
                <li>Select your export format based on training needs</li>
                <li>Configure train/validation split ratio</li>
                <li>Optionally filter by constitution version</li>
                <li>Enable auto-tuning to start Vertex AI jobs</li>
                <li>Export and download your dataset or monitor training</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Colab Instructions Modal */}
      {showColabModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <Code2 style={styles.modalTitleIcon} />
                Ready to Open Google Colab!
              </h3>
              <button onClick={handleCloseModal} style={styles.closeButton}>
                <X style={styles.closeIcon} />
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.downloadSuccess}>
                <CheckCircle2 style={styles.downloadSuccessIcon} />
                <p style={styles.downloadSuccessText}>
                  Notebook downloaded: <strong>{pendingColabData?.notebook_filename}</strong>
                </p>
              </div>
              
              <div style={styles.instructionsSection}>
                <h4 style={styles.instructionsTitle}>
                  <FileUp style={styles.instructionsIcon} />
                  How to upload to Google Colab:
                </h4>
                <ol style={styles.instructionsList}>
                  <li>Click "Open Google Colab" below</li>
                  <li>In Colab, click <strong>File → Upload notebook</strong></li>
                  <li>Select the downloaded <code>.ipynb</code> file</li>
                  <li>Run the notebook cells to start training!</li>
                </ol>
              </div>
              
              <div style={styles.dataStats}>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Total Records:</span>
                  <span style={styles.statValue}>{pendingColabData?.total_records}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Format:</span>
                  <span style={styles.statValue}>{pendingColabData?.format}</span>
                </div>
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <Button onClick={handleCloseModal} style={styles.laterButton}>
                I'll do it later
              </Button>
              <Button onClick={handleOpenColab} style={styles.openColabButton}>
                <ExternalLink style={styles.buttonIcon} />
                Open Google Colab
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    gap: '24px',
    height: '100%',
    width: '100%',
  },
  mainContent: {
    flex: '2',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    minWidth: '600px',
  },
  sidebar: {
    flex: '1',
    minWidth: '300px',
    maxWidth: '400px',
  },
  configCard: {
    backgroundColor: 'rgba(11, 14, 17, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
  },
  cardHeader: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '16px',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#fff',
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
  },
  titleIcon: {
    width: '24px',
    height: '24px',
    color: '#23d9d9',
  },
  cardContent: {
    padding: '24px',
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
  },
  sectionIcon: {
    width: '18px',
    height: '18px',
    color: '#23d9d9',
  },
  formatGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  formatOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'rgba(26, 31, 37, 0.8)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  formatOptionSelected: {
    backgroundColor: 'rgba(35, 217, 217, 0.1)',
    border: '2px solid #23d9d9',
  },
  formatIcon: {
    fontSize: '24px',
  },
  formatLabel: {
    color: '#cfd8e3',
    fontSize: '14px',
    fontWeight: '500',
    flex: 1,
  },
  checkIcon: {
    width: '20px',
    height: '20px',
    color: '#23d9d9',
    position: 'absolute',
    top: '8px',
    right: '8px',
  },
  formatDescription: {
    marginTop: '8px',
    padding: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  descText: {
    color: '#b0bec5',
    fontSize: '13px',
    marginBottom: '8px',
  },
  schemaCode: {
    display: 'block',
    color: '#23d9d9',
    fontSize: '12px',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '8px',
    borderRadius: '4px',
    overflowX: 'auto',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    color: '#cfd8e3',
    fontSize: '14px',
    fontWeight: '500',
  },
  textInput: {
    padding: '10px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: '#cfd8e3',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  numberInput: {
    padding: '6px 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    color: '#cfd8e3',
    fontSize: '14px',
    width: '60px',
    outline: 'none',
  },
  select: {
    padding: '10px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: '#cfd8e3',
    fontSize: '14px',
    outline: 'none',
  },
  splitControls: {
    display: 'flex',
    gap: '16px',
  },
  splitInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  splitLabel: {
    color: '#8f9aa6',
    fontSize: '13px',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    color: '#cfd8e3',
    fontSize: '14px',
    cursor: 'pointer',
  },
  exportButtonContainer: {
    marginTop: '24px',
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#23d9d9',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  colabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  buttonIcon: {
    width: '20px',
    height: '20px',
  },
  spinningIcon: {
    width: '20px',
    height: '20px',
    animation: 'spin 1s linear infinite',
  },
  resultCard: {
    backgroundColor: 'rgba(11, 14, 17, 0.6)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '12px',
  },
  successIcon: {
    width: '24px',
    height: '24px',
    color: '#22c55e',
  },
  successMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
  messageIcon: {
    width: '20px',
    height: '20px',
    color: '#22c55e',
    flexShrink: 0,
  },
  messageText: {
    color: '#22c55e',
    fontSize: '14px',
    fontWeight: '500',
    margin: 0,
    marginBottom: '8px',
  },
  colabLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: 'rgba(255, 152, 0, 0.9)',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500',
    padding: '4px 8px',
    border: '1px solid rgba(255, 152, 0, 0.3)',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
      borderColor: 'rgba(255, 152, 0, 0.6)',
    },
  },
  colabLinkIcon: {
    width: '14px',
    height: '14px',
  },
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  resultItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  resultLabel: {
    color: '#8f9aa6',
    fontSize: '13px',
  },
  resultValue: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
  },
  vertexJobInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  vertexBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    color: '#22c55e',
    border: '1px solid #22c55e',
  },
  badgeIcon: {
    width: '14px',
    height: '14px',
    marginRight: '4px',
  },
  jobId: {
    color: '#22c55e',
    fontSize: '13px',
    fontFamily: 'monospace',
  },
  downloadSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  downloadTitle: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
  },
  downloadGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
  },
  downloadLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: 'rgba(26, 31, 37, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#23d9d9',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(35, 217, 217, 0.1)',
      border: '1px solid #23d9d9',
      transform: 'translateY(-2px)',
    }
  },
  downloadIcon: {
    width: '16px',
    height: '16px',
  },
  localFileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: 'rgba(26, 31, 37, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
  },
  localFilePath: {
    color: '#8f9aa6',
    fontSize: '13px',
    fontFamily: 'monospace',
  },
  noteText: {
    color: '#fbbf24',
    fontSize: '13px',
    marginBottom: '12px',
    fontStyle: 'italic',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  alertIcon: {
    width: '16px',
    height: '16px',
    color: '#ef4444',
  },
  infoCard: {
    backgroundColor: 'rgba(11, 14, 17, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
  },
  infoSection: {
    marginBottom: '24px',
  },
  infoTitle: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  infoText: {
    color: '#b0bec5',
    fontSize: '13px',
    lineHeight: '1.5',
    margin: 0,
  },
  dataSourceList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formatInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formatItem: {
    color: '#b0bec5',
    fontSize: '12px',
    lineHeight: '1.4',
  },
  workflowList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#b0bec5',
    fontSize: '13px',
    lineHeight: '1.6',
  },
  
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'rgba(11, 14, 17, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#fff',
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
  },
  modalTitleIcon: {
    width: '24px',
    height: '24px',
    color: 'rgba(255, 152, 0, 0.9)',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#8f9aa6',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    '&:hover': {
      color: '#fff',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  closeIcon: {
    width: '20px',
    height: '20px',
  },
  modalBody: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  downloadSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
  downloadSuccessIcon: {
    width: '20px',
    height: '20px',
    color: '#22c55e',
    flexShrink: 0,
  },
  downloadSuccessText: {
    color: '#22c55e',
    fontSize: '14px',
    margin: 0,
  },
  instructionsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  instructionsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
  },
  instructionsIcon: {
    width: '18px',
    height: '18px',
    color: 'rgba(255, 152, 0, 0.9)',
  },
  instructionsList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#cfd8e3',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  dataStats: {
    display: 'flex',
    gap: '20px',
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statLabel: {
    color: '#8f9aa6',
    fontSize: '12px',
  },
  statValue: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    padding: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    justifyContent: 'flex-end',
  },
  laterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#cfd8e3',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  openColabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};