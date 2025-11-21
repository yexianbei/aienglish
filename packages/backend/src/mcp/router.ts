import type { Request, Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './server';

/**
 * 将 MCP Server 挂载到现有 Express 应用上
 * ChatGPT 将通过 /mcp 路径访问
 */
export const mcpHandler = async (req: Request, res: Response) => {
  // 处理 CORS 预检
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
      'Access-Control-Allow-Headers': 'content-type, mcp-session-id',
      'Access-Control-Expose-Headers': 'Mcp-Session-Id',
    });
    res.end();
    return;
  }

  // 仅允许 MCP 相关方法
  const MCP_METHODS = new Set(['POST', 'GET', 'DELETE']);
  if (!req.method || !MCP_METHODS.has(req.method)) {
    res.status(405).end('Method Not Allowed');
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');

  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // 无状态模式
    enableJsonResponse: true,
  });

  res.on('close', () => {
    transport.close();
    server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res);
  } catch (error) {
    // 这里不能用自定义 Log，避免循环依赖
    // eslint-disable-next-line no-console
    console.error('处理 MCP 请求出错:', error);
    if (!res.headersSent) {
      res.writeHead(500).end('Internal server error');
    }
  }
};


