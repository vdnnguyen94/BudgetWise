import parentService from '../services/parentService';

// Mock fetch globally
global.fetch = jest.fn();

describe('Parent Service Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'token') return 'fake-jwt-token';
      return null;
    });
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // ========================================
  // TEST 1: Get Children Service
  // ========================================
  describe('getChildren', () => {
    it('should fetch all children successfully', async () => {
      const mockChildren = {
        children: [
          {
            _id: 'child1',
            username: 'Alice',
            email: 'alice@example.com',
            role: 'Child'
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChildren
      });

      const result = await parentService.getChildren();

      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/api/parent/children`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-jwt-token'
          })
        })
      );
      expect(result).toEqual(mockChildren);
    });

    it('should throw error when fetch fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Unauthorized' })
      });

      await expect(parentService.getChildren()).rejects.toThrow('Unauthorized');
    });
  });

  // ========================================
  // TEST 2: Add Child Service
  // ========================================
  describe('addChild', () => {
    it('should add a child successfully', async () => {
      const childData = {
        username: 'NewChild',
        email: 'newchild@example.com',
        password: 'password123',
        dateOfBirth: '2010-05-15',
        allowance: 20
      };

      const mockResponse = {
        message: 'Child account created successfully',
        child: {
          _id: 'child1',
          ...childData
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await parentService.addChild(childData);

      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/api/parent/children`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-jwt-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(childData)
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when email already exists', async () => {
      const childData = {
        username: 'NewChild',
        email: 'existing@example.com',
        password: 'password123'
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Email already in use' })
      });

      await expect(parentService.addChild(childData)).rejects.toThrow('Email already in use');
    });
  });

  // ========================================
  // TEST 3: Remove Child Service
  // ========================================
  describe('removeChild', () => {
    it('should remove a child successfully', async () => {
      const childId = 'child123';
      const mockResponse = {
        message: 'Child account removed successfully'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await parentService.removeChild(childId);

      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/api/parent/children/${childId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-jwt-token'
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when child not found', async () => {
      const childId = 'nonexistent';

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Child account not found' })
      });

      await expect(parentService.removeChild(childId)).rejects.toThrow('Child account not found');
    });
  });

  // ========================================
  // TEST 4: Update Child Service
  // ========================================
  describe('updateChild', () => {
    it('should update a child successfully', async () => {
      const childId = 'child123';
      const updateData = {
        username: 'UpdatedName',
        allowance: 30
      };

      const mockResponse = {
        message: 'Child account updated successfully',
        child: {
          _id: childId,
          ...updateData
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await parentService.updateChild(childId, updateData);

      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/api/parent/children/${childId}`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-jwt-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(updateData)
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ========================================
  // TEST 5: Get Child By ID Service
  // ========================================
  describe('getChildById', () => {
    it('should fetch specific child details', async () => {
      const childId = 'child123';
      const mockChild = {
        child: {
          _id: childId,
          username: 'Alice',
          email: 'alice@example.com',
          role: 'Child'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChild
      });

      const result = await parentService.getChildById(childId);

      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/api/parent/children/${childId}`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-jwt-token'
          })
        })
      );
      expect(result).toEqual(mockChild);
    });

    it('should throw error when child does not belong to parent', async () => {
      const childId = 'otherchild';

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'This child does not belong to your account' })
      });

      await expect(parentService.getChildById(childId)).rejects.toThrow(
        'This child does not belong to your account'
      );
    });
  });
});