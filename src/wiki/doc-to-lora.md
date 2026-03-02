# Doc-to-LoRA: Instant Document Internalization for LLMs

Doc-to-LoRA (D2L) is a breakthrough technique developed by Sakana AI that enables large language models to rapidly absorb and reliably utilize information from specific documents. Instead of traditional fine-tuning, it uses hypernetworks to dynamically adapt the model for context-specific knowledge.

## What Problem Does It Solve?

Large language models face a fundamental challenge: they can hallucinate when asked about specific facts or documents they weren't trained on. Traditional solutions like fine-tuning are slow and permanently alter the model. Doc-to-LoRA solves this by:

- **Instant contextualization**: Load a document and the model immediately incorporates it
- **Non-invasive**: Doesn't permanently change the base model
- **Reversible**: Clear the information and return to the original state
- **Reliable**: Reduces hallucinations when working with provided documents

## How It Works

Doc-to-LoRA uses a hypernetwork architecture—a smaller neural network that generates weights for the main model. When you "internalize" a document:

1. The document is processed and encoded
2. The hypernetwork generates task-specific parameter updates (similar to LoRA adapters)
3. These parameters are temporarily applied to the model
4. The model can now accurately reference information from that document
5. Call `reset()` to remove the internalization and restore the original model

This is fundamentally different from traditional fine-tuning because:
- No permanent model weights are changed
- Multiple documents can be handled by the same base model
- The process is nearly instantaneous
- The same model can work with completely different documents in sequence

## Key Features

### Python API
```python
# Load a pre-trained model
model = D2LModel.from_pretrained("sakana-ai/doc-to-lora-base")

# Internalize a document
model.internalize(document_text)

# Generate with document context
response = model.generate("What does the document say about X?")

# Reset to original state
model.reset()
```

### Interactive Web Demo
Sakana AI provides a live web interface at [pub.sakana.ai/doc-to-lora/](https://pub.sakana.ai/doc-to-lora/) where you can test the technology without installation.

### Pre-trained Models
Models are available on Hugging Face under the SakanaAI organization, making it easy to get started with minimal setup.

### Evaluation Tools
The repository includes:
- NIAH (Needle in a Haystack) testing for evaluating retrieval accuracy
- Experimental scripts for reproduction
- Data visualization tools for inspecting training samples

## Use Cases

**Knowledge Management**: Let employees ask an AI about company-specific documents without storing proprietary information in the model weights.

**Customer Support**: Rapidly adapt the same model to handle support questions about different products or versions.

**Document Analysis**: Process and summarize documents on-demand without retraining.

**Research**: Quickly test how models incorporate and use specific research papers.

**Legal/Compliance**: Work with specific legal documents or contracts while maintaining model generalization.

## Research Background

Doc-to-LoRA is backed by peer-reviewed research published in an academic paper (arXiv:2602.15902). The approach represents an advance in efficient model adaptation and contextual knowledge integration.

## Installation

The project uses `uv` for package management:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Then clone the repository and follow the README for setup.

## Getting Started

1. **No Installation**: Try the [web demo](https://pub.sakana.ai/doc-to-lora/) first
2. **Python Users**: Install and use the Python API for integration
3. **Researchers**: Review the paper and experiment with the evaluation scripts
4. **Integration**: Use pre-trained models from Hugging Face in your applications

## Resources

- **GitHub**: [SakanaAI/doc-to-lora](https://github.com/SakanaAI/doc-to-lora)
- **Web Demo**: [pub.sakana.ai/doc-to-lora/](https://pub.sakana.ai/doc-to-lora/)
- **Paper**: arXiv:2602.15902
- **Models**: [Hugging Face SakanaAI](https://huggingface.co/SakanaAI)

## Why This Matters for Fogsift

This technology is relevant for diagnostic consulting because:

- **Context-aware reasoning**: Models can accurately work with specific documents and data
- **Efficient knowledge integration**: Adapt models to domain-specific knowledge without expensive retraining
- **Reliable information synthesis**: Reduce hallucinations when working from provided sources
- **Scalable consulting tools**: Build AI-assisted consulting tools that maintain accuracy across different client contexts

## Further Reading

- The official GitHub repository for code and experiments
- The academic paper for technical depth
- The web demo for interactive exploration
