// lib/dlpService.js
import { dlpClient } from './googleCloud.js';

export async function redactPII(text) {
  // If DLP client isn't working or text is empty, return original text
  if (!dlpClient || !text) {
    console.log('DLP client not available or text is empty');
    return text;
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  
  if (!projectId) {
    console.error('GOOGLE_CLOUD_PROJECT_ID not set');
    return text;
  }

  const request = {
    parent: `projects/${projectId}/locations/global`,
    item: {
      value: text,  // This is correct
    },
    inspectConfig: {
      infoTypes: [
        { name: 'EMAIL_ADDRESS' },
        { name: 'PHONE_NUMBER' },
        { name: 'INDIA_PAN_INDIVIDUAL' },
        { name: 'INDIA_AADHAAR_INDIVIDUAL' },
        { name: 'CREDIT_CARD_NUMBER' },
        { name: 'INDIA_GST_INDIVIDUAL' }
      ],
      minLikelihood: 'POSSIBLE',  // Changed from LIKELIHOOD_UNSPECIFIED
    },
    deidentifyConfig: {
      infoTypeTransformations: {
        transformations: [
          {
            primitiveTransformation: {
              characterMaskConfig: {
                maskingCharacter: '*',
                numberToMask: 0,
                reverseOrder: false,
              },  
            },
          },
        ],
      },
    },
  };

  try {
    console.log(`Calling DLP API for text of length: ${text.length}`);
    const [response] = await dlpClient.deidentifyContent(request);
    console.log('DLP redaction successful');
    return response.item.value;
  } catch (error) {
    console.error('DLP Redaction Error:', error.message);
    console.error('Error details:', error);
    // If DLP fails, return original text as failsafe
    return text; 
  }
}