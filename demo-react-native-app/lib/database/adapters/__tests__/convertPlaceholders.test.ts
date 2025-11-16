import { convertPlaceholders } from '../inMemory';

describe('convertPlaceholders', () => {
  it('converts single placeholder', () => {
    const result = convertPlaceholders('SELECT * FROM users WHERE id = ?', ['user-123']);

    expect(result.sql).toBe('SELECT * FROM users WHERE id = $1');
    expect(result.bindObject).toEqual({ $1: 'user-123' });
  });

  it('converts multiple placeholders in order', () => {
    const result = convertPlaceholders('INSERT INTO users (name, age, email) VALUES (?, ?, ?)', [
      'John',
      30,
      'john@example.com',
    ]);

    expect(result.sql).toBe('INSERT INTO users (name, age, email) VALUES ($1, $2, $3)');
    expect(result.bindObject).toEqual({
      $1: 'John',
      $2: 30,
      $3: 'john@example.com',
    });
  });

  it('handles empty args', () => {
    const result = convertPlaceholders('SELECT * FROM users', []);

    expect(result.sql).toBe('SELECT * FROM users');
    expect(result.bindObject).toEqual({});
  });

  it('handles different value types', () => {
    const result = convertPlaceholders(
      'INSERT INTO data (str, num, bool, nil) VALUES (?, ?, ?, ?)',
      ['text', 42, true, null]
    );

    expect(result.bindObject).toEqual({
      $1: 'text',
      $2: 42,
      $3: true,
      $4: null,
    });
  });

  it('handles strings with commas', () => {
    const result = convertPlaceholders('INSERT INTO items (name, description) VALUES (?, ?)', [
      'Apple, Orange, Banana',
      'A list of fruits, separated by commas',
    ]);

    expect(result.sql).toBe('INSERT INTO items (name, description) VALUES ($1, $2)');
    expect(result.bindObject).toEqual({
      $1: 'Apple, Orange, Banana',
      $2: 'A list of fruits, separated by commas',
    });
  });

  it('handles strings with special characters (newlines, carriage returns)', () => {
    const result = convertPlaceholders('INSERT INTO notes (content) VALUES (?)', [
      'Line 1\nLine 2\rLine 3\r\nLine 4',
    ]);

    expect(result.sql).toBe('INSERT INTO notes (content) VALUES ($1)');
    expect(result.bindObject).toEqual({
      $1: 'Line 1\nLine 2\rLine 3\r\nLine 4',
    });
  });

  it('throws error when too few arguments provided', () => {
    expect(() => {
      convertPlaceholders('SELECT * FROM users WHERE id = ? AND name = ?', ['only-one']);
    }).toThrow('Placeholder count mismatch: SQL has 2 placeholders but 1 arguments provided');
  });

  it('throws error when too many arguments provided', () => {
    expect(() => {
      convertPlaceholders('SELECT * FROM users WHERE id = ?', [
        'id-1',
        'extra-arg',
        'another-extra',
      ]);
    }).toThrow('Placeholder count mismatch: SQL has 1 placeholders but 3 arguments provided');
  });
});
