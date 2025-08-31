// Security utilities untuk validasi dan sanitasi input

const validateSecureInput = (value, fieldName) => {
  if (!value || typeof value !== 'string') {
    return { isValid: true, message: '' };
  }

  const input = value.toString().toLowerCase();
  
  const dangerousPatterns = [
    /alert\s*\(/i, /confirm\s*\(/i, /prompt\s*\(/i, /eval\s*\(/i,
    /function\s*\(/i, /document\./i, /window\./i, /console\./i,
    /<script/i, /<\/script/i, /<iframe/i, /<object/i, /<embed/i,
    /on\w+\s*=/i, /javascript:/i, /vbscript:/i, /data:/i,
    /union\s+select/i, /drop\s+table/i, /delete\s+from/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return {
        isValid: false,
        message: `${fieldName} tidak boleh mengandung kode HTML, JavaScript, atau karakter berbahaya`
      };
    }
  }

  const suspiciousChars = ['<', '>', '{', '}', '(', ')', ';', '&'];
  const hasSuspiciousChars = suspiciousChars.some(char => input.includes(char));
  
  if (hasSuspiciousChars) {
    return {
      isValid: false,
      message: `${fieldName} tidak boleh mengandung karakter khusus seperti < > { } ( ) ; &`
    };
  }

  if (value.length > 255) {
    return {
      isValid: false,
      message: `${fieldName} tidak boleh lebih dari 255 karakter`
    };
  }

  return { isValid: true, message: '' };
};

const sanitizeInput = (value) => {
  if (!value || typeof value !== 'string') {
    return value;
  }
  
  return value
    .replace(/[<>]/g, '')
    .replace(/[{}]/g, '')
    .replace(/[()]/g, '')
    .replace(/[;&]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

const validateRequiredFields = (req, res, fields) => {
  const errors = [];
  
  for (const field of fields) {
    const value = req.body[field];
    if (!value || value.toString().trim() === '') {
      switch (field) {
        case 'username': errors.push('Mohon isi username terlebih dahulu'); break;
        case 'userdesc': errors.push('Mohon isi userdesc terlebih dahulu'); break;
        case 'pass': errors.push('Mohon isi pass terlebih dahulu'); break;
        case 'usertype': errors.push('Mohon isi usertype terlebih dahulu'); break;
        case 'jenisuser': errors.push('Mohon isi jenisuser terlebih dahulu'); break;
        case 'cabang': errors.push('Mohon isi cabang terlebih dahulu'); break;
        case 'id': errors.push('Mohon isi id terlebih dahulu'); break;
        default: errors.push(`Mohon isi ${field} terlebih dahulu`);
      }
    } else {
      const securityCheck = validateSecureInput(value, field);
      if (!securityCheck.isValid) {
        errors.push(securityCheck.message);
      }
    }
  }
  
  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: errors.join(', ')
    });
    return false;
  }
  return true;
};

const validateFieldSecurity = (req, res) => {
  const fieldsToCheck = ['username', 'userdesc', 'pass', 'usertype', 'jenisuser', 'cabang'];
  const errors = [];
  
  for (const field of fieldsToCheck) {
    if (req.body[field] !== undefined) {
      const securityCheck = validateSecureInput(req.body[field], field);
      if (!securityCheck.isValid) {
        errors.push(securityCheck.message);
      }
    }
  }
  
  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: errors.join(', ')
    });
    return false;
  }
  return true;
};

module.exports = {
  validateSecureInput,
  sanitizeInput,
  validateRequiredFields,
  validateFieldSecurity
};
