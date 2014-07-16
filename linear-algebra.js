(function (root, factory) {
  "use strict";

  // AMD
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  }
  // CommonJS
  else if (typeof exports === 'object') {
    module.exports = factory();
  }
  // Browser
  else {
    root.linearAlgebra = factory();
  }
})(this, function () {
  "use strict";


  /**
   * OOP inheritance.
   * @param  {Class} ctor      child
   * @param  {Class} superCtor parent
   */
  var _inherits = function (ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            enumerable: false
        }
    });
  };



  /**
   * Initialise the linear algebra library.
   * 
   * @param  {Function} add Function to add floating point numbers, accepts an array as parameter.
   * @return {Object} Linear algebra primitives.
   */
  return function(add) {
    // default adder
    add = add || function(floats) {
      var ret = floats[0];

      for (var i=1; i<floats.length; ++i) {
        ret += floats[i];
      }

      return ret;
    };


    var LinAlg = {};



    // ------------------------------
    // NumArray - base class for vectors and matrices
    // ------------------------------


    /** 
     * Construct a vector.
     *
     * @param {Array} data Array of values representing vector.
     * 
     * @constructor
     */
    var NumArray = function(data) {
      this._data = data;
    };



    /**
     * Size.
     */
    NumArray.prototype.size = function() {
      return this._dim;
    };


    /**
     * Raw data.
     */
    NumArray.prototype.data = function() {
      return this._data;
    };






    // ------------------------------
    // Vectors
    // ------------------------------


    /** 
     * Construct a vector.
     *
     * @param {Array} data Array of values representing vector.
     * 
     * @constructor
     */
    var Vector = LinAlg.Vector = function(data) {
      NumArray.call(this, data);
      this._dim = data.length;
    };
    _inherits(Vector, NumArray);


    /**
     * Is this a vector?
     */
    Object.defineProperty(Vector.prototype, 'isVector', { value: true } );



    /**
     * Scale this vector.
     * @param  {Number} scale Scaling factor.
     * @return this
     */
    Vector.prototype.scale = function(scale) {
      for (var i = 0; i<this._dim; ++i) {
        this._data[i] *= scale;
      }

      return this;
    };


    /**
     * Compute dot product of this vector with another one.
     * @param  {Vector} vector.
     * @return {NumArray}
     */
    Vector.prototype.dot = function(vector) {
      if (this._dim !== vector._dim) {
        throw new Error('Vector dot product requires vectors to have same size');
      }

      var a = new Array(this._dim);

      for (var i=0; i<this._dim; ++i) {
        a[i] = this._data[i] * vector._data[i];
      }

      return new Vector(a);
    };


    // ------------------------------
    // Matrices
    // ------------------------------



    /** 
     * Construct a matrix.
     *
     * @param {Arrya} data Array of arrays representing matrix.
     * 
     * @constructor
     */
    var Matrix = LinAlg.Matrix = function(data) {
      NumArray.call(this, data);
      this._rows = data.length;
      this._cols = data[0].length;
      this._dim = [this._rows, this._cols];
    };
    _inherits(Matrix, NumArray);



    /**
     * Is this a matrix?
     */
    Object.defineProperty(Matrix.prototype, 'isMatrix', { value: true });



    /**
     * Scale this matrix.
     * @param  {Number} scale Scaling factor.
     * @return this
     */
    Matrix.prototype.scale = function(scale) {
      for (var i = 0; i<this._rows; ++i) {
        for (var j = 0; j<this._cols; ++j) {
          this._data[i][j] *= scale;
        }
      }

      return this;
    };




    /**
     * Multiply this matrix by a matrix or vector.
     * @param  {Matrix|Vector} arg Matrix or vector.
     * @return {Matrix|Vector} A Matrix or Vector depending on the result.
     */
    Matrix.prototype.mul = function(arg) {
      var result, tmp, i, j, k;

      // matrix
      if (arg.isMatrix) {
        if (this._cols !== arg._rows) {
          throw new Error('Multiplying by matrix requires this.columns = matrix.rows');
        }

        result = new Array(this._rows);
        tmp = new Array(this._cols);

        for (i=0; i<this._rows; ++i) {
          result[i] = new Array(arg._cols);

          for (k=0; k<arg._cols; ++k) {

            for (j=0; j<this._cols; ++j) {
              tmp[j] = this._data[i][j] * arg._data[j][k];
            }

            result[i][k] = add(tmp);
          }
        }

        return new Matrix(result);
      }
      // vector
      else if (arg.isVector) {
        if (this._cols !== arg._dim) {
          throw new Error('Multiplying by vector requires this.columns = vector.size');
        }

        result = new Array(this._rows);
        tmp = new Array(arg._dim);

        for (i=0; i<this._rows; ++i) {

          for (j=0; j<this._cols; ++j) {
            // store values to add in temporary array
            tmp[j] = this._data[i][j] * arg._data[j];
          }
          // add up the values
          result[i] = add(tmp);
        }

        return new Vector(result);
      }
    };



    /**
     * Get transpose of this matrix.
     * @return {Matrix}
     */
    Matrix.prototype.transpose = function() {
      var result = new Array(this._cols),
        i, j;

      for (j=0; j<this._cols; ++j) {
        result[j] = new Array(this._rows);

        for (i=0; i<this._rows; ++i) {
          result[j][i] = this._data[i][j];
        }
      }

      return new Matrix(result);
    }




    /**
     * Create an identity matrix of given dimensions.
     * @param  {Integer} dim Length of one side.
     * @return {Matrix}
     */
    Matrix.identity = function(dim) {
      return Matrix.scalar(dim, 1);
    };  



    /**
     * Create a diagonal matrix.
     * @param  {Array} entrires Diagonal entries.
     * @return {Matrix}
     */
    Matrix.diagonal = function(entries) {
      var dim = entries.length,
        i, j;

      var a = new Array(dim);
      for (i=0; i<dim; ++i) {
        a[i] = new Array(dim);

        for (j=0; j<dim; ++j) {
          a[i][j] = 0;
        }

        a[i][i] = entries[i];
      }

      return new Matrix(a);
    };




    /**
     * Create a scalar diagonal matrix.
     * @param {Integer} dim Matrix size (length of each side)
     * @param  {Number} entry The value to place in each diagonal.
     * @return {Matrix}
     */
    Matrix.scalar = function(dim, entry) {
      var a = new Array(dim),
        i, j;

      for (i=0; i<dim; ++i) {
        a[i] = new Array(dim);

        for (j=0; j<dim; ++j) {
          a[i][j] = 0;
        }

        a[i][i] = entry;
      }

      return new Matrix(a);
    };

    return LinAlg;
  }
});

