let tracesData = [];
const fragment_code = 
  `#version 300 es
    precision mediump float;
    flat in int dis;
    in vec3 colorFrag;
    out vec4 outColor;
    
    void main(void)
    {
        outColor = vec4(colorFrag, 1.0);
    }
    `;
const vertex_code = 
  `#version 300 es
    in vec2 coordinates;
    out vec3 colorFrag;
    uniform int cur_stalled_vertex;
    
    float stall_function()
    {
        float res = 15.0;
    
        for(int i =1; i < 0xfffff; i++)
        {
            res *= (res * float(i));
        }
        return res;
    }            
    
    void main(void)
    {
    
        float res = 0.0;
    
        if(cur_stalled_vertex == gl_VertexID)
        {
            res = stall_function();
            colorFrag = vec3(1, 0, res / 255.0);
        }
        else
        {
            colorFrag = vec3(0, 1, 0);
        }
        
        gl_Position = vec4(coordinates, 1.0, 1.0);
    
        gl_PointSize = 5.0;
    
    }
    `;

function createVerticesList(numOfVertices)
{
  let inc = 1 / (numOfVertices/4 + 1); // +1 for convince

  let num = 0;

  let vertices = [];

  let j = 0;

  for(let i=0; i < numOfVertices*2; i++)
  {
    if (i % 8 === 0)
    {
      num+=inc;
    }

    switch (j)
    {
      case 0:
      case 1:
      case 4:
      case 7:
        vertices.push(num);
        j = (j+1) % 8;
        break;
      case 2:
      case 3:
      case 5:
      case 6:
        vertices.push(-num);
        j = (j+1) % 8;
        break;

    }
  }

  return vertices;

}

function getFingerprint()
{
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext("webgl", {antialias: false});
  const startTimestamp = Date.now();
  let NUM_OF_VERTICES = document.getElementById("vertices").value;
  let NUM_OF_SAMPLES_PER_VERTEX = document.getElementById("samples").value;
  //let NUM_AMPLIFICATION = document.getElementById("amplification").value;

  var vertices = createVerticesList(NUM_OF_VERTICES);

  var vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


  // Vertex shader
  var vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertex_code);
  gl.compileShader(vertShader);
  var compiled = gl.getShaderParameter(vertShader, gl.COMPILE_STATUS);
  if (!compiled) {
    console.error(gl.getShaderInfoLog(vertShader));
  }

  // Fragment shader
  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragment_code);
  gl.compileShader(fragShader);
  compiled = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
  if (!compiled) {
    console.error(gl.getShaderInfoLog(fragShader));
  }

  // Shader program
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

  var coord = gl.getAttribLocation(shaderProgram, "coordinates");
  gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coord);
  var instance_buffer = gl.createBuffer();
  var instances = [0.0, 1.0, 0.0, 1.0];
  gl.bindBuffer(gl.ARRAY_BUFFER, instance_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instances), gl.STATIC_DRAW);

  // /*============Drawing ====================*/

  let prev_time = 0;
  let cur_time = 0;
  let prev_timestamp = 0;
  let cur_iteration = 0;
  let num_of_vertices = vertices.length / 2;
  let max_iterations = num_of_vertices * NUM_OF_SAMPLES_PER_VERTEX;
  let stalled_vertex_id = 0;

  let cur_stalled_vertex = gl.getUniformLocation(shaderProgram, "cur_stalled_vertex");
  gl.uniform1i(cur_stalled_vertex, 0);
  
  const tracesRequest = [];
  const tracesPerformanceNow = [];

  function renderLoop(timestamp) {
    cur_time = performance.now();
    
    if (cur_iteration !== 0){
      // Saving the time taken for one complete iteration from two different methods
      tracesRequest[cur_iteration-1] = timestamp - prev_timestamp;
      tracesPerformanceNow[cur_iteration-1] = cur_time - prev_time;
      
      // Preparing attributes for the next iteration
      if (cur_iteration % NUM_OF_SAMPLES_PER_VERTEX === 0){
        stalled_vertex_id++;
        if (num_of_vertices === stalled_vertex_id){
          stalled_vertex_id = 0;
        }
        gl.uniform1i(cur_stalled_vertex, stalled_vertex_id);
      }
    }

    if (cur_iteration === max_iterations) {
      tracesData.push({
        'user-Agent': navigator.userAgent,
        //'webGLVendor': gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_VENDOR_WEBGL),
        //'webGLRenderer': gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL),
        'tracesRequest': tracesRequest,
        'tracesPerformanceNow': tracesPerformanceNow,
        'startTimestamp': startTimestamp,
      });
      console.log("Traces from requestAnimationFrame | performance.now()");
      for(let i = 0; i<tracesRequest.length; i++){
        console.log(tracesRequest[i] + " | " + tracesPerformanceNow[i]);
      }
    } else {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.clearColor(1.0, 1.0, 1.0, 1);
      gl.drawArrays(gl.POINTS, 0, vertices.length / 2);
      
      cur_iteration++;
      prev_timestamp = timestamp;
      prev_time = cur_time;
      requestAnimationFrame(renderLoop);
    }
  }

  requestAnimationFrame(renderLoop);
}
