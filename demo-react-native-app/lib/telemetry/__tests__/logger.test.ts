import { SpanStatusCode } from '@opentelemetry/api';

// Mock the tracer before importing logger
const mockSpan = {
  setStatus: jest.fn(),
  end: jest.fn(),
};

jest.mock('../telemetry', () => ({
  tracer: {
    startSpan: jest.fn(() => mockSpan),
  },
}));

import { logger } from '../logger';
import { tracer } from '../telemetry';

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('sensitive data redaction', () => {
    it('should redact apiKey', () => {
      logger.info('Test', { apiKey: 'secret123', label: 'visible' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        expect.objectContaining({
          apiKey: '[REDACTED]',
          label: 'visible',
        })
      );
    });

    it('should redact password', () => {
      logger.info('Test', { password: 'secret', user: 'john' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          password: '[REDACTED]',
          user: 'john',
        })
      );
    });

    it('should redact token', () => {
      logger.info('Test', { authToken: 'bearer-xyz', id: 123 });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          authToken: '[REDACTED]',
          id: 123,
        })
      );
    });

    it('should redact email', () => {
      logger.info('Test', { email: 'test@example.com', action: 'login' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          email: '[REDACTED]',
          action: 'login',
        })
      );
    });

    it('should redact phone', () => {
      logger.info('Test', { phone: '555-123-4567', id: 123 });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          phone: '[REDACTED]',
          id: 123,
        })
      );
    });

    it('should redact nested sensitive keys', () => {
      logger.info('Test', {
        config: {
          apiKey: 'secret',
          url: 'https://api.com',
        },
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          config: expect.objectContaining({
            apiKey: '[REDACTED]',
            url: 'https://api.com',
          }),
        })
      );
    });

    it('should handle null and undefined values', () => {
      expect(() => {
        logger.info('Test', { value: null, other: undefined });
      }).not.toThrow();
    });

    it('should handle arrays with sensitive data', () => {
      logger.info('Test', {
        items: [{ password: 'secret' }, { label: 'visible' }],
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          items: [{ password: '[REDACTED]' }, { label: 'visible' }],
        })
      );
    });
  });

  describe('log levels', () => {
    it('debug() should log to console but NOT create OTel span', () => {
      logger.debug('Debug message', { data: 'test' });

      expect(consoleSpy).toHaveBeenCalled();
      expect(tracer.startSpan).not.toHaveBeenCalled();
    });

    it('info() should log to console but NOT create OTel span', () => {
      logger.info('Info message', { data: 'test' });

      expect(consoleSpy).toHaveBeenCalled();
      expect(tracer.startSpan).not.toHaveBeenCalled();
    });

    it('warn() should log to console AND create OTel span', () => {
      logger.warn('Warning message', { data: 'test' });

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(tracer.startSpan).toHaveBeenCalledWith('log.warn', expect.any(Object));
      expect(mockSpan.end).toHaveBeenCalled();
    });

    it('error() should log to console AND create error OTel span', () => {
      logger.error('Error message', { error: 'something failed' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(tracer.startSpan).toHaveBeenCalledWith('log.error', expect.any(Object));
      expect(mockSpan.setStatus).toHaveBeenCalledWith(
        expect.objectContaining({ code: SpanStatusCode.ERROR })
      );
      expect(mockSpan.end).toHaveBeenCalled();
    });

    it('should log without context', () => {
      logger.info('Simple message');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO] Simple message'));
    });
  });

  describe('perf()', () => {
    it('should create OTel span with performance data', () => {
      logger.perf('api_call', { value: 250, status: 'success' });

      expect(tracer.startSpan).toHaveBeenCalledWith(
        'perf.api_call',
        expect.objectContaining({
          attributes: expect.objectContaining({
            'perf.name': 'api_call',
            'perf.duration_ms': 250,
          }),
        })
      );
      expect(mockSpan.end).toHaveBeenCalled();
    });

    it('should set error status when status is error', () => {
      logger.perf('api_call', { value: 250, status: 'error' });

      expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.ERROR });
    });

    it('should redact sensitive data in perf context', () => {
      logger.perf('api_call', { value: 100, apiKey: 'secret' });

      expect(tracer.startSpan).toHaveBeenCalledWith(
        'perf.api_call',
        expect.objectContaining({
          attributes: expect.objectContaining({
            apiKey: '[REDACTED]',
          }),
        })
      );
    });
  });

  describe('action()', () => {
    it('should create OTel span for user action', () => {
      logger.action('button_clicked', { button: 'save' });

      expect(tracer.startSpan).toHaveBeenCalledWith(
        'action.button_clicked',
        expect.objectContaining({
          attributes: expect.objectContaining({
            'action.name': 'button_clicked',
            button: 'save',
          }),
        })
      );
      expect(mockSpan.end).toHaveBeenCalled();
    });

    it('should work without data parameter', () => {
      logger.action('page_loaded');

      expect(tracer.startSpan).toHaveBeenCalledWith(
        'action.page_loaded',
        expect.objectContaining({
          attributes: expect.objectContaining({
            'action.name': 'page_loaded',
          }),
        })
      );
    });

    it('should redact sensitive data in action context', () => {
      logger.action('login', { email: 'test@example.com' });

      expect(tracer.startSpan).toHaveBeenCalledWith(
        'action.login',
        expect.objectContaining({
          attributes: expect.objectContaining({
            email: '[REDACTED]',
          }),
        })
      );
    });
  });

  describe('child()', () => {
    it('should create logger with module prefix', () => {
      const child = logger.child({ module: 'TestModule' });
      child.info('Child message');

      // When no context is provided, logger only passes message string
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TestModule]')
      );
    });

    it('should include prefix in OTel span messages', () => {
      const child = logger.child({ module: 'TestModule' });
      child.error('Child error');

      expect(tracer.startSpan).toHaveBeenCalledWith('log.error', {
        attributes: expect.objectContaining({
          'log.message': expect.stringContaining('[TestModule]'),
        }),
      });
    });

    it('should work with perf and action methods', () => {
      const child = logger.child({ module: 'TestModule' });
      child.perf('operation', { value: 100 });
      child.action('test_action');

      expect(tracer.startSpan).toHaveBeenCalledWith('perf.operation', expect.any(Object));
      expect(tracer.startSpan).toHaveBeenCalledWith('action.test_action', expect.any(Object));
    });
  });

  describe('PII Protection', () => {
    it('should never include email patterns in logs', () => {
      logger.info('User action', { email: 'test@example.com', name: 'John' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ email: '[REDACTED]' })
      );
    });

    it('should never include phone patterns in logs', () => {
      logger.info('Contact', { phone: '555-123-4567', id: 123 });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ phone: '[REDACTED]' })
      );
    });

    it('should redact authorization header', () => {
      logger.info('Request', { authorization: 'Bearer token123' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ authorization: '[REDACTED]' })
      );
    });

    it('should redact deviceId and userId', () => {
      logger.info('Device info', { deviceId: 'abc123', userId: 'user456' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          deviceId: '[REDACTED]',
          userId: '[REDACTED]',
        })
      );
    });
  });
});
